"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addStyleToBlock = addStyleToBlock;
exports.extendBlockStructure = extendBlockStructure;
exports.getFirstBlockMarkdownRange = getFirstBlockMarkdownRange;
exports.isBlockMarkdownType = isBlockMarkdownType;
var _inlineImage = require("../inputElements/inlineImage");
function addStyleToBlock(targetElement, type, markdownStyle) {
  const node = targetElement;
  switch (type) {
    case 'line':
      Object.assign(node.style, markdownStyle.line);
      break;
    case 'syntax':
      Object.assign(node.style, markdownStyle.syntax);
      break;
    case 'bold':
      Object.assign(node.style, {
        fontWeight: 'bold',
        ...markdownStyle.bold
      });
      break;
    case 'italic':
      Object.assign(node.style, {
        fontStyle: 'italic',
        ...markdownStyle.italic
      });
      break;
    case 'strikethrough':
      Object.assign(node.style, {
        textDecoration: 'line-through',
        ...markdownStyle.strikethrough
      });
      break;
    case 'emoji':
      Object.assign(node.style, {
        verticalAlign: 'middle',
        ...markdownStyle.emoji
      });
      break;
    case 'mention-here':
      Object.assign(node.style, markdownStyle.mentionHere);
      break;
    case 'mention-user':
      Object.assign(node.style, markdownStyle.mentionUser);
      break;
    case 'mention-report':
      Object.assign(node.style, markdownStyle.mentionReport);
      break;
    case 'link':
      Object.assign(node.style, {
        textDecoration: 'underline',
        ...markdownStyle.link
      });
      break;
    case 'code':
      Object.assign(node.style, markdownStyle.code);
      break;
    case 'pre':
      Object.assign(node.style, markdownStyle.pre);
      break;
    case 'blockquote':
      Object.assign(node.style, {
        borderLeftStyle: 'solid',
        display: 'inline-block',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowWrap: 'anywhere',
        ...markdownStyle.blockquote
      });
      break;
    case 'h1':
      Object.assign(node.style, {
        fontWeight: 'bold',
        ...markdownStyle.h1
      });
      break;
    case 'block':
      Object.assign(node.style, {
        display: 'block',
        margin: '0',
        padding: '0',
        position: 'relative',
        ...markdownStyle.block
      });
      break;
    default:
      break;
  }
}
const BLOCK_MARKDOWN_TYPES = ['inline-image'];
const FULL_LINE_MARKDOWN_TYPES = ['blockquote'];
function isBlockMarkdownType(type) {
  return BLOCK_MARKDOWN_TYPES.includes(type);
}
function getFirstBlockMarkdownRange(ranges) {
  const blockMarkdownRange = ranges.find(r => isBlockMarkdownType(r.type) || FULL_LINE_MARKDOWN_TYPES.includes(r.type));
  return FULL_LINE_MARKDOWN_TYPES.includes((blockMarkdownRange === null || blockMarkdownRange === void 0 ? void 0 : blockMarkdownRange.type) || '') ? undefined : blockMarkdownRange;
}
function extendBlockStructure(currentInput, targetNode, currentRange, ranges, text, markdownStyle, inlineImagesProps) {
  switch (currentRange.type) {
    case 'inline-image':
      return (0, _inlineImage.addInlineImagePreview)(currentInput, targetNode, text, ranges, markdownStyle, inlineImagesProps);
    default:
      break;
  }
  return targetNode;
}
//# sourceMappingURL=blockUtils.js.map