"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getElementHeight = getElementHeight;
exports.getPlaceholderValue = getPlaceholderValue;
exports.isEventComposing = isEventComposing;
exports.normalizeValue = normalizeValue;
exports.parseInnerHTMLToText = parseInnerHTMLToText;
const ZERO_WIDTH_SPACE = '\u200B';

// If an Input Method Editor is processing key input, the 'keyCode' is 229.
// https://www.w3.org/TR/uievents/#determine-keydown-keyup-keyCode
function isEventComposing(nativeEvent) {
  return nativeEvent.isComposing || nativeEvent.keyCode === 229;
}
function getPlaceholderValue(placeholder) {
  if (!placeholder) {
    return ZERO_WIDTH_SPACE;
  }
  return placeholder.length ? placeholder : ZERO_WIDTH_SPACE;
}
function getElementHeight(node, styles, numberOfLines) {
  if (numberOfLines) {
    const tempElement = document.createElement('div');
    tempElement.setAttribute('contenteditable', 'true');
    Object.assign(tempElement.style, styles);
    tempElement.textContent = Array(numberOfLines).fill('A').join('\n');
    if (node.parentElement) {
      node.parentElement.appendChild(tempElement);
      const height = tempElement.clientHeight;
      node.parentElement.removeChild(tempElement);
      return height ? `${height}px` : 'auto';
    }
  }
  return styles.height ? `${styles.height}px` : 'auto';
}
function normalizeValue(value) {
  return value.replaceAll('\r\n', '\n');
}

// Parses the HTML structure of a MarkdownTextInputElement to a plain text string. Used for getting the correct value of the input element.
function parseInnerHTMLToText(target, cursorPosition, inputType) {
  // Returns the parent of a given node that is higher in the hierarchy and is of a different type than 'text', 'br' or 'line'
  function getTopParentNode(node) {
    let currentParentNode = node.parentNode;
    while (currentParentNode && ['text', 'br', 'line'].includes(((_currentParentNode$pa = currentParentNode.parentElement) === null || _currentParentNode$pa === void 0 ? void 0 : _currentParentNode$pa.getAttribute('data-type')) || '')) {
      var _currentParentNode$pa, _currentParentNode;
      currentParentNode = ((_currentParentNode = currentParentNode) === null || _currentParentNode === void 0 ? void 0 : _currentParentNode.parentNode) || null;
    }
    return currentParentNode;
  }
  const stack = [target];
  let text = '';
  let shouldAddNewline = false;
  const lastNode = target.childNodes[target.childNodes.length - 1];
  // Remove the last <br> element if it's the last child of the target element. Fixes the issue with adding extra newline when pasting into the empty input.
  if ((lastNode === null || lastNode === void 0 ? void 0 : lastNode.nodeName) === 'DIV' && (lastNode === null || lastNode === void 0 ? void 0 : lastNode.innerHTML) === '<br>') {
    target.removeChild(lastNode);
  }
  while (stack.length > 0) {
    var _node$parentElement;
    const node = stack.pop();
    if (!node) {
      break;
    }

    // If we are operating on the nodes that are children of the MarkdownTextInputElement, we need to add a newline after each
    const isTopComponent = ((_node$parentElement = node.parentElement) === null || _node$parentElement === void 0 ? void 0 : _node$parentElement.contentEditable) === 'true';
    if (isTopComponent) {
      // Replaced text is beeing added as text node, so we need to not add the newline before and after it
      if (node.nodeType === Node.TEXT_NODE) {
        shouldAddNewline = false;
      } else {
        var _firstChild$getAttrib;
        const firstChild = node.firstChild;
        const containsEmptyBlockElement = (firstChild === null || firstChild === void 0 || (_firstChild$getAttrib = firstChild.getAttribute) === null || _firstChild$getAttrib === void 0 ? void 0 : _firstChild$getAttrib.call(firstChild, 'data-type')) === 'block' && firstChild.textContent === '';
        if (shouldAddNewline && !containsEmptyBlockElement) {
          text += '\n';
          shouldAddNewline = false;
        }
        shouldAddNewline = true;
      }
    }
    if (node.nodeType === Node.TEXT_NODE) {
      // Parse text nodes into text
      text += node.textContent;
    } else if (node.nodeName === 'BR') {
      var _parentNode$parentEle;
      const parentNode = getTopParentNode(node);
      if (parentNode && ((_parentNode$parentEle = parentNode.parentElement) === null || _parentNode$parentEle === void 0 ? void 0 : _parentNode$parentEle.contentEditable) !== 'true' && !!node.getAttribute('data-id')) {
        // Parse br elements into newlines only if their parent is not a child of the MarkdownTextInputElement (a paragraph when writing or a div when pasting).
        // It prevents adding extra newlines when entering text
        text += '\n';
      }
    } else {
      let i = node.childNodes.length - 1;
      while (i > -1) {
        const child = node.childNodes[i];
        if (!child) {
          break;
        }
        stack.push(child);
        i--;
      }
    }
  }
  text = text.replaceAll('\r\n', '\n');

  // Force letter removal if the input value haven't changed but input type is 'delete'
  if (text === target.value && inputType !== null && inputType !== void 0 && inputType.includes('delete')) {
    text = text.slice(0, cursorPosition - 1) + text.slice(cursorPosition);
  }
  return text;
}
//# sourceMappingURL=inputUtils.js.map