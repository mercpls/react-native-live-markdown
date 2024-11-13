import type { MarkdownTextInputElement } from '../../MarkdownTextInput.web';
import type { InlineImagesInputProps, MarkdownRange } from '../../commonTypes';
import type { PartialMarkdownStyle } from '../../styleUtils';
import type { NodeType, TreeNode } from './treeUtils';
declare function addStyleToBlock(targetElement: HTMLElement, type: NodeType, markdownStyle: PartialMarkdownStyle): void;
declare function isBlockMarkdownType(type: NodeType): boolean;
declare function getFirstBlockMarkdownRange(ranges: MarkdownRange[]): MarkdownRange | undefined;
declare function extendBlockStructure(currentInput: MarkdownTextInputElement, targetNode: TreeNode, currentRange: MarkdownRange, ranges: MarkdownRange[], text: string, markdownStyle: PartialMarkdownStyle, inlineImagesProps: InlineImagesInputProps): TreeNode;
export { addStyleToBlock, extendBlockStructure, isBlockMarkdownType, getFirstBlockMarkdownRange };
//# sourceMappingURL=blockUtils.d.ts.map