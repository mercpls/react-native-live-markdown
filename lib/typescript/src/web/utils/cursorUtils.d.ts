import type { MarkdownTextInputElement } from '../../MarkdownTextInput.web';
import type { TreeNode } from './treeUtils';
declare function setCursorPosition(target: MarkdownTextInputElement, startIndex: number, endIndex?: number | null, shouldScrollIntoView?: boolean): void;
declare function scrollIntoView(target: MarkdownTextInputElement, node: TreeNode): void;
declare function moveCursorToEnd(target: HTMLElement): void;
declare function getCurrentCursorPosition(target: MarkdownTextInputElement): {
    start: number;
    end: number;
} | null;
declare function removeSelection(): void;
export { getCurrentCursorPosition, moveCursorToEnd, setCursorPosition, removeSelection, scrollIntoView };
//# sourceMappingURL=cursorUtils.d.ts.map