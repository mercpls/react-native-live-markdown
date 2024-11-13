import type { MarkdownStyle } from './MarkdownTextInputDecoratorViewNativeComponent';
type PartialMarkdownStyle = Partial<{
    [K in keyof MarkdownStyle]: Partial<MarkdownStyle[K]>;
}>;
declare function mergeMarkdownStyleWithDefault(input: PartialMarkdownStyle | undefined): MarkdownStyle;
declare function parseStringWithUnitToNumber(value: string | null): number;
export type { PartialMarkdownStyle };
export { mergeMarkdownStyleWithDefault, parseStringWithUnitToNumber };
//# sourceMappingURL=styleUtils.d.ts.map