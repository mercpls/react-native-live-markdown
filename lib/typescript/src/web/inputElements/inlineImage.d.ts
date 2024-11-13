import type { MarkdownTextInputElement } from '../../MarkdownTextInput.web';
import type { InlineImagesInputProps, MarkdownRange } from '../../commonTypes';
import type { PartialMarkdownStyle } from '../../styleUtils';
import type { TreeNode } from '../utils/treeUtils';
/** The main function that adds inline image preview to the node */
declare function addInlineImagePreview(currentInput: MarkdownTextInputElement, targetNode: TreeNode, text: string, ranges: MarkdownRange[], markdownStyle: PartialMarkdownStyle, inlineImagesProps: InlineImagesInputProps): TreeNode;
declare function forceRefreshAllImages(currentInput: MarkdownTextInputElement, markdownStyle: PartialMarkdownStyle): void;
export { addInlineImagePreview, forceRefreshAllImages };
//# sourceMappingURL=inlineImage.d.ts.map