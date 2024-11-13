import type { TextInput, TextInputProps } from 'react-native';
import React from 'react';
import type { MouseEvent } from 'react';
import type { TreeNode } from './web/utils/treeUtils';
import './web/MarkdownTextInput.css';
import type { MarkdownStyle } from './MarkdownTextInputDecoratorViewNativeComponent';
import type { InlineImagesInputProps } from './commonTypes';
interface MarkdownTextInputProps extends TextInputProps, InlineImagesInputProps {
    markdownStyle?: MarkdownStyle;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    dir?: string;
    disabled?: boolean;
}
type MarkdownTextInput = TextInput & React.Component<MarkdownTextInputProps>;
type Selection = {
    start: number;
    end: number;
};
type MarkdownTextInputElement = HTMLDivElement & HTMLInputElement & {
    tree: TreeNode;
    selection: Selection;
    imageElements: HTMLImageElement[];
};
type HTMLMarkdownElement = HTMLElement & {
    value: string;
};
declare const MarkdownTextInput: React.ForwardRefExoticComponent<MarkdownTextInputProps & React.RefAttributes<MarkdownTextInput>>;
export default MarkdownTextInput;
export type { MarkdownTextInputProps, MarkdownTextInputElement, HTMLMarkdownElement };
//# sourceMappingURL=MarkdownTextInput.web.d.ts.map