import type { CSSProperties } from 'react';
import type { MarkdownTextInputElement } from '../../MarkdownTextInput.web';
declare function isEventComposing(nativeEvent: globalThis.KeyboardEvent): boolean;
declare function getPlaceholderValue(placeholder: string | undefined): string;
declare function getElementHeight(node: HTMLDivElement, styles: CSSProperties, numberOfLines: number | undefined): string;
declare function normalizeValue(value: string): string;
declare function parseInnerHTMLToText(target: MarkdownTextInputElement, cursorPosition: number, inputType?: string): string;
export { isEventComposing, getPlaceholderValue, getElementHeight, parseInnerHTMLToText, normalizeValue };
//# sourceMappingURL=inputUtils.d.ts.map