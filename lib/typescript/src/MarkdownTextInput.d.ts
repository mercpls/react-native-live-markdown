import { TextInput } from 'react-native';
import React from 'react';
import type { TextInputProps } from 'react-native';
import type { PartialMarkdownStyle } from './styleUtils';
import type { InlineImagesInputProps } from './commonTypes';
interface MarkdownTextInputProps extends TextInputProps, InlineImagesInputProps {
    markdownStyle?: PartialMarkdownStyle;
}
type MarkdownTextInput = TextInput & React.Component<MarkdownTextInputProps>;
declare const MarkdownTextInput: React.ForwardRefExoticComponent<MarkdownTextInputProps & React.RefAttributes<MarkdownTextInput>>;
export type { PartialMarkdownStyle as MarkdownStyle, MarkdownTextInputProps };
export default MarkdownTextInput;
//# sourceMappingURL=MarkdownTextInput.d.ts.map