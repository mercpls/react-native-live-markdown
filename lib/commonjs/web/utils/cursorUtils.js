"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCurrentCursorPosition = getCurrentCursorPosition;
exports.moveCursorToEnd = moveCursorToEnd;
exports.removeSelection = removeSelection;
exports.scrollIntoView = scrollIntoView;
exports.setCursorPosition = setCursorPosition;
var _treeUtils = require("./treeUtils");
function setCursorPosition(target, startIndex, endIndex = null, shouldScrollIntoView = false) {
  // We don't want to move the cursor if the target is not focused
  if (!target.tree || target !== document.activeElement) {
    return;
  }
  const start = Math.max(0, Math.min(startIndex, target.tree.length));
  const end = endIndex ? Math.max(0, Math.min(endIndex, target.tree.length)) : null;
  if (end && end < start) {
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(target);
  const startTreeNode = (0, _treeUtils.getTreeNodeByIndex)(target.tree, start);
  const endTreeNode = end && startTreeNode && (end < startTreeNode.start || end >= startTreeNode.start + startTreeNode.length) ? (0, _treeUtils.getTreeNodeByIndex)(target.tree, end) : startTreeNode;
  if (!startTreeNode || !endTreeNode) {
    console.error('Invalid start or end tree node');
    return;
  }
  if (startTreeNode.type === 'br') {
    range.setStartBefore(startTreeNode.element);
  } else {
    const startElement = startTreeNode.element;
    range.setStart(startElement.childNodes[0] || startElement, start - startTreeNode.start);
  }
  if (endTreeNode.type === 'br') {
    range.setEndBefore(endTreeNode.element);
  } else {
    const endElement = endTreeNode.element;
    range.setEnd(endElement.childNodes[0] || endElement, (end || start) - endTreeNode.start);
  }
  if (!end) {
    range.collapse(true);
  }
  const selection = window.getSelection();
  if (selection) {
    selection.setBaseAndExtent(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
  }
  if (shouldScrollIntoView) {
    scrollIntoView(target, endTreeNode);
  }
}
function scrollIntoView(target, node) {
  var _target$tree$childNod;
  const targetElement = target;
  const orderIndex = Number(node.orderIndex.split(',')[0]);
  const currentLine = (_target$tree$childNod = target.tree.childNodes[orderIndex]) === null || _target$tree$childNod === void 0 ? void 0 : _target$tree$childNod.element;
  const scrollTargetElement = currentLine || node.element;
  const caretRect = scrollTargetElement.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  // In case the caret is below the visible input area, scroll to the end of the node
  if (caretRect.top + caretRect.height > targetRect.top + targetRect.height) {
    targetElement.scrollTop = caretRect.top - targetRect.top + target.scrollTop - targetRect.height + caretRect.height + 4;
    return;
  }
  scrollTargetElement.scrollIntoView({
    block: 'nearest'
  });
}
function moveCursorToEnd(target) {
  const range = document.createRange();
  const selection = window.getSelection();
  if (selection) {
    range.setStart(target, target.childNodes.length);
    range.collapse(true);
    selection.setBaseAndExtent(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
  }
}
function getCurrentCursorPosition(target) {
  function getHTMLElement(node) {
    let element = node;
    if (element instanceof Text) {
      element = node.parentElement;
    }
    return element;
  }
  const selection = window.getSelection();
  if (!selection || selection && selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0);
  const startElement = getHTMLElement(range.startContainer);
  const endElement = range.startContainer === range.endContainer ? startElement : getHTMLElement(range.endContainer);
  const startTreeNode = (0, _treeUtils.findHTMLElementInTree)(target.tree, startElement);
  const endTreeNode = (0, _treeUtils.findHTMLElementInTree)(target.tree, endElement);
  let start = -1;
  let end = -1;
  if (startTreeNode && endTreeNode) {
    start = startTreeNode.start + range.startOffset;

    // If the end node is a root node, we need to set the end to the end of the text (FireFox fix)
    if ((endTreeNode === null || endTreeNode === void 0 ? void 0 : endTreeNode.parentNode) === null) {
      end = target.value.length;
    } else {
      end = endTreeNode.start + range.endOffset;
    }
  }
  return {
    start,
    end
  };
}
function removeSelection() {
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }
}
//# sourceMappingURL=cursorUtils.js.map