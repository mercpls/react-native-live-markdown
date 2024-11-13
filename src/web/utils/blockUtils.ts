import type {MarkdownTextInputElement} from '../../MarkdownTextInput.web';
import type {InlineImagesInputProps, MarkdownRange} from '../../commonTypes';
import type {PartialMarkdownStyle} from '../../styleUtils';
import {addInlineImagePreview} from '../inputElements/inlineImage';
import type {NodeType, TreeNode} from './treeUtils';

function addStyleToBlock(targetElement: HTMLElement, type: NodeType, markdownStyle: PartialMarkdownStyle) {
  const node = targetElement;
  switch (type) {
    case 'line':
      Object.assign(node.style, markdownStyle.line);
      break;
    case 'syntax':
      Object.assign(node.style, markdownStyle.syntax);
      break;
    case 'bold':
      Object.assign(node.style, {fontWeight: 'bold', ...markdownStyle.bold});
      break;
    case 'italic':
      Object.assign(node.style, {fontStyle: 'italic', ...markdownStyle.italic});
      break;
    case 'strikethrough':
      Object.assign(node.style, {textDecoration: 'line-through', ...markdownStyle.strikethrough});
      break;
    case 'emoji':
      Object.assign(node.style, {verticalAlign: 'middle', ...markdownStyle.emoji});
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
        ...markdownStyle.link,
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
        ...markdownStyle.blockquote,
      });
      break;
    case 'h1':
      Object.assign(node.style, {
        fontWeight: 'bold',
        ...markdownStyle.h1,
      });
      break;
    case 'block':
      Object.assign(node.style, {
        display: 'block',
        margin: '0',
        padding: '0',
        position: 'relative',
        ...markdownStyle.block,
      });
      break;
    default:
      break;
  }
}

const BLOCK_MARKDOWN_TYPES = ['inline-image'];
const FULL_LINE_MARKDOWN_TYPES = ['blockquote'];

function isBlockMarkdownType(type: NodeType) {
  return BLOCK_MARKDOWN_TYPES.includes(type);
}

function getFirstBlockMarkdownRange(ranges: MarkdownRange[]) {
  const blockMarkdownRange = ranges.find((r) => isBlockMarkdownType(r.type) || FULL_LINE_MARKDOWN_TYPES.includes(r.type));
  return FULL_LINE_MARKDOWN_TYPES.includes(blockMarkdownRange?.type || '') ? undefined : blockMarkdownRange;
}

function extendBlockStructure(
  currentInput: MarkdownTextInputElement,
  targetNode: TreeNode,
  currentRange: MarkdownRange,
  ranges: MarkdownRange[],
  text: string,
  markdownStyle: PartialMarkdownStyle,
  inlineImagesProps: InlineImagesInputProps,
) {
  switch (currentRange.type) {
    case 'inline-image':
      return addInlineImagePreview(currentInput, targetNode, text, ranges, markdownStyle, inlineImagesProps);
    default:
      break;
  }

  return targetNode;
}

export {addStyleToBlock, extendBlockStructure, isBlockMarkdownType, getFirstBlockMarkdownRange};
