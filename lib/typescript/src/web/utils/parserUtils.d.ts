import type { HTMLMarkdownElement, MarkdownTextInputElement } from '../../MarkdownTextInput.web';
import type { TreeNode } from './treeUtils';
import type { PartialMarkdownStyle } from '../../styleUtils';
import type { InlineImagesInputProps, MarkdownRange } from '../../commonTypes';
/** Builds HTML DOM structure based on passed text and markdown ranges */
declare function parseRangesToHTMLNodes(text: string, ranges: MarkdownRange[], isMultiline?: boolean, markdownStyle?: PartialMarkdownStyle, disableInlineStyles?: boolean, currentInput?: MarkdownTextInputElement | null, inlineImagesProps?: InlineImagesInputProps): {
    dom: HTMLMarkdownElement;
    tree: TreeNode;
};
declare function updateInputStructure(target: MarkdownTextInputElement, text: string, cursorPositionIndex: number | null, isMultiline?: boolean, markdownStyle?: PartialMarkdownStyle, alwaysMoveCursorToTheEnd?: boolean, shouldForceDOMUpdate?: boolean, shouldScrollIntoView?: boolean, inlineImagesProps?: InlineImagesInputProps): {
    text: string;
    cursorPosition: number;
};
export { updateInputStructure, parseRangesToHTMLNodes };
//# sourceMappingURL=parserUtils.d.ts.map