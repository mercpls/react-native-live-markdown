import type {ColorValue, ViewProps, TextStyle, ViewStyle, ImageStyle} from 'react-native';

import type {Float} from 'react-native/Libraries/Types/CodegenTypes';

import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

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

export default codegenNativeComponent<NativeProps>('MarkdownTextInputDecoratorView', {
  interfaceOnly: true,
});

export type {MarkdownStyle};
