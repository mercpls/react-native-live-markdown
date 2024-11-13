/// <reference types="react-native/types/modules/codegen" />
/// <reference types="react-native/codegen" />
import type { ColorValue, ViewProps, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import type { Float } from 'react-native/Libraries/Types/CodegenTypes';
interface MarkdownStyle {
    syntax?: TextStyle;
    emoji?: TextStyle;
    link?: TextStyle;
    h1?: TextStyle;
    blockquote?: ViewStyle;
    code?: TextStyle;
    pre?: TextStyle;
    mentionHere?: TextStyle;
    mentionUser?: TextStyle;
    mentionReport?: TextStyle;
    block?: ViewStyle;
    strikethrough?: TextStyle;
    bold?: TextStyle;
    italic?: TextStyle;
    line?: ViewStyle;
    inlineImage?: ImageStyle;
    loadingIndicatorContainer?: ViewStyle;
    loadingIndicator?: {
        primaryColor?: ColorValue;
        secondaryColor?: ColorValue;
        width?: Float;
        height?: Float;
        borderWidth?: Float;
    };
}
interface NativeProps extends ViewProps {
    markdownStyle: MarkdownStyle;
}
declare const _default: import("react-native/Libraries/Utilities/codegenNativeComponent").NativeComponentType<NativeProps>;
export default _default;
export type { MarkdownStyle };
//# sourceMappingURL=MarkdownTextInputDecoratorViewNativeComponent.d.ts.map