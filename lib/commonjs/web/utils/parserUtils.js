"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseRangesToHTMLNodes = parseRangesToHTMLNodes;
exports.updateInputStructure = updateInputStructure;
var _treeUtils = require("./treeUtils");
var _cursorUtils = require("./cursorUtils");
var _blockUtils = require("./blockUtils");
var _animationUtils = require("./animationUtils");
function ungroupRanges(ranges) {
  const ungroupedRanges = [];
  ranges.forEach(range => {
    if (!range.depth) {
      ungroupedRanges.push(range);
    }
    const {
      depth,
      ...rangeWithoutDepth
    } = range;
    Array.from({
      length: depth
    }).forEach(() => {
      ungroupedRanges.push(rangeWithoutDepth);
    });
  });
  return ungroupedRanges;
}
function splitTextIntoLines(text) {
  let lineStartIndex = 0;
  const lines = text.split('\n').map(line => {
    const lineObject = {
      text: line,
      start: lineStartIndex,
      length: line.length,
      markdownRanges: []
    };
    lineStartIndex += line.length + 1; // Adding 1 for the newline character
    return lineObject;
  });
  return lines;
}

/** Merges lines that contain multiline markdown tags into one line */
function mergeLinesWithMultilineTags(lines, ranges) {
  let mergedLines = [...lines];
  const lineIndexes = mergedLines.map((_line, index) => index);
  ranges.forEach(range => {
    const beginLineIndex = mergedLines.findLastIndex(line => line.start <= range.start);
    const endLineIndex = mergedLines.findIndex(line => line.start + line.length >= range.start + range.length);
    const correspondingLineIndexes = lineIndexes.slice(beginLineIndex, endLineIndex + 1);
    if (correspondingLineIndexes.length > 0) {
      const mainLineIndex = correspondingLineIndexes[0];
      const mainLine = mergedLines[mainLineIndex];
      mainLine.markdownRanges.push(range);
      const otherLineIndexes = correspondingLineIndexes.slice(1);
      otherLineIndexes.forEach(lineIndex => {
        const otherLine = mergedLines[lineIndex];
        mainLine.text += `\n${otherLine.text}`;
        mainLine.length += otherLine.length + 1;
        mainLine.markdownRanges.push(...otherLine.markdownRanges);
      });
      if (otherLineIndexes.length > 0) {
        mergedLines = mergedLines.filter((_line, index) => !otherLineIndexes.includes(index));
      }
    }
  });
  return mergedLines;
}

/** Adds a value prop to the element and appends the value to the parent node element */
function appendValueToElement(element, parentTreeNode, value) {
  const targetElement = element;
  const parentNode = parentTreeNode;
  targetElement.value = value;
  parentNode.element.value = (parentNode.element.value || '') + value;
}
function appendNode(element, parentTreeNode, type, length) {
  const node = (0, _treeUtils.addNodeToTree)(element, parentTreeNode, type, length);
  parentTreeNode.element.appendChild(element);
  return node;
}
function addBrElement(node) {
  const span = document.createElement('span');
  span.setAttribute('data-type', 'br');
  appendValueToElement(span, node, '\n');
  const spanNode = appendNode(span, node, 'br', 1);
  appendNode(document.createElement('br'), spanNode, 'br', 1);
  return spanNode;
}
function addTextToElement(node, text) {
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (line !== '') {
      const span = document.createElement('span');
      appendValueToElement(span, node, line);
      span.setAttribute('data-type', 'text');
      span.appendChild(document.createTextNode(line));
      appendNode(span, node, 'text', line.length);
    }
    if (index < lines.length - 1 || index === 0 && line === '') {
      addBrElement(node);
    }
  });
}
function addParagraph(node, text = null, length, disableInlineStyles = false) {
  const p = document.createElement('p');
  p.setAttribute('data-type', 'line');
  if (!disableInlineStyles) {
    (0, _blockUtils.addStyleToBlock)(p, 'line', {});
  }
  const pNode = appendNode(p, node, 'line', length);
  if (text === '') {
    // If the line is empty, we still need to add a br element to keep the line height
    addBrElement(pNode);
  } else if (text) {
    addTextToElement(pNode, text);
  }
  return pNode;
}
function addBlockWrapper(targetNode, length, markdownStyle) {
  const span = document.createElement('span');
  span.setAttribute('data-type', 'block');
  (0, _blockUtils.addStyleToBlock)(span, 'block', markdownStyle);
  return appendNode(span, targetNode, 'block', length);
}

/** Builds HTML DOM structure based on passed text and markdown ranges */
function parseRangesToHTMLNodes(text, ranges, isMultiline = true, markdownStyle = {}, disableInlineStyles = false, currentInput = null, inlineImagesProps = {}) {
  const rootElement = document.createElement('span');
  const textLength = text.length;
  const rootNode = (0, _treeUtils.createRootTreeNode)(rootElement, textLength);
  let currentParentNode = rootNode;
  let lines = splitTextIntoLines(text);
  if (ranges.length === 0) {
    lines.forEach(line => {
      addParagraph(rootNode, line.text, line.length, disableInlineStyles);
    });
    return {
      dom: rootElement,
      tree: rootNode
    };
  }
  const markdownRanges = ungroupRanges(ranges);
  lines = mergeLinesWithMultilineTags(lines, markdownRanges);
  let lastRangeEndIndex = 0;
  while (lines.length > 0) {
    const line = lines.shift();
    if (!line) {
      break;
    }

    // preparing line paragraph element for markdown text
    currentParentNode = addParagraph(rootNode, null, line.length, disableInlineStyles);
    rootElement.value = (rootElement.value || '') + line.text;
    if (lines.length > 0) {
      rootElement.value = `${rootElement.value || ''}\n`;
    }
    if (line.markdownRanges.length === 0) {
      addTextToElement(currentParentNode, line.text);
    }
    let wasBlockGenerated = false;
    lastRangeEndIndex = line.start;
    const lineMarkdownRanges = line.markdownRanges;
    // go through all markdown ranges in the line
    while (lineMarkdownRanges.length > 0) {
      const range = lineMarkdownRanges.shift();
      if (!range) {
        break;
      }
      const endOfCurrentRange = range.start + range.length;
      const nextRangeStartIndex = lineMarkdownRanges.length > 0 && !!lineMarkdownRanges[0] ? lineMarkdownRanges[0].start || 0 : textLength;

      // wrap all elements before the first block type markdown range with a span element
      const blockRange = (0, _blockUtils.getFirstBlockMarkdownRange)([range, ...lineMarkdownRanges]);
      if (!wasBlockGenerated && blockRange) {
        currentParentNode = addBlockWrapper(currentParentNode, line.text.substring(lastRangeEndIndex - line.start, blockRange.start + blockRange.length - line.start).length, markdownStyle);
        wasBlockGenerated = true;
      }
      // add text before the markdown range
      const textBeforeRange = line.text.substring(lastRangeEndIndex - line.start, range.start - line.start);
      if (textBeforeRange) {
        addTextToElement(currentParentNode, textBeforeRange);
      }

      // create markdown span element
      const span = document.createElement('span');
      span.setAttribute('data-type', range.type);
      if (!disableInlineStyles) {
        (0, _blockUtils.addStyleToBlock)(span, range.type, markdownStyle);
      }
      const spanNode = appendNode(span, currentParentNode, range.type, range.length);
      if (isMultiline && !disableInlineStyles && currentInput) {
        currentParentNode = (0, _blockUtils.extendBlockStructure)(currentInput, currentParentNode, range, lineMarkdownRanges, text, markdownStyle, inlineImagesProps);
      }
      if (lineMarkdownRanges.length > 0 && nextRangeStartIndex < endOfCurrentRange && range.type !== 'syntax') {
        // tag nesting
        currentParentNode = spanNode;
        lastRangeEndIndex = range.start;
      } else {
        // adding markdown tag
        addTextToElement(spanNode, text.substring(range.start, endOfCurrentRange));
        currentParentNode.element.value = (currentParentNode.element.value || '') + (spanNode.element.value || '');
        lastRangeEndIndex = endOfCurrentRange;
        // tag unnesting and adding text after the tag
        while (currentParentNode.parentNode !== null && nextRangeStartIndex >= currentParentNode.start + currentParentNode.length) {
          const textAfterRange = line.text.substring(lastRangeEndIndex - line.start, currentParentNode.start - line.start + currentParentNode.length);
          if (textAfterRange) {
            addTextToElement(currentParentNode, textAfterRange);
          }
          lastRangeEndIndex = currentParentNode.start + currentParentNode.length;
          if (currentParentNode.parentNode.type !== 'root') {
            currentParentNode.parentNode.element.value = currentParentNode.element.value || '';
          }
          if ((0, _blockUtils.isBlockMarkdownType)(currentParentNode.type)) {
            wasBlockGenerated = false;
          }
          currentParentNode = currentParentNode.parentNode || rootNode;
        }
      }
    }
  }
  return {
    dom: rootElement,
    tree: rootNode
  };
}
function moveCursor(isFocused, alwaysMoveCursorToTheEnd, cursorPosition, target, shouldScrollIntoView = false) {
  if (!isFocused) {
    return;
  }
  if (alwaysMoveCursorToTheEnd || cursorPosition === null) {
    (0, _cursorUtils.moveCursorToEnd)(target);
  } else if (cursorPosition !== null) {
    (0, _cursorUtils.setCursorPosition)(target, cursorPosition, null, shouldScrollIntoView);
  }
}
function updateInputStructure(target, text, cursorPositionIndex, isMultiline = true, markdownStyle = {}, alwaysMoveCursorToTheEnd = false, shouldForceDOMUpdate = false, shouldScrollIntoView = false, inlineImagesProps = {}) {
  const targetElement = target;

  // in case the cursorPositionIndex is larger than text length, cursorPosition will be null, i.e: move the caret to the end
  let cursorPosition = cursorPositionIndex !== null && cursorPositionIndex <= text.length ? cursorPositionIndex : null;
  const isFocused = document.activeElement === target;
  if (isFocused && cursorPositionIndex === null) {
    const selection = (0, _cursorUtils.getCurrentCursorPosition)(target);
    cursorPosition = selection ? selection.start : null;
  }
  const markdownRanges = global.parseExpensiMarkToRanges(text);
  if (!text || targetElement.innerHTML === '<br>' || targetElement && targetElement.innerHTML === '\n') {
    targetElement.innerHTML = '';
    targetElement.innerText = '';
  }

  // We don't want to parse text with single '\n', because contentEditable represents it as invisible <br />
  if (text) {
    const {
      dom,
      tree
    } = parseRangesToHTMLNodes(text, markdownRanges, isMultiline, markdownStyle, false, targetElement, inlineImagesProps);
    if (shouldForceDOMUpdate || targetElement.innerHTML !== dom.innerHTML) {
      const animationTimes = (0, _animationUtils.getAnimationCurrentTimes)(targetElement);
      targetElement.innerHTML = '';
      targetElement.innerText = '';
      targetElement.innerHTML = dom.innerHTML;
      (0, _animationUtils.updateAnimationsTime)(targetElement, animationTimes);
    }
    (0, _treeUtils.updateTreeElementRefs)(tree, targetElement);
    targetElement.tree = tree;
    moveCursor(isFocused, alwaysMoveCursorToTheEnd, cursorPosition, targetElement, shouldScrollIntoView);
  } else {
    targetElement.tree = (0, _treeUtils.createRootTreeNode)(targetElement);
  }
  return {
    text,
    cursorPosition: cursorPosition || 0
  };
}
//# sourceMappingURL=parserUtils.js.map