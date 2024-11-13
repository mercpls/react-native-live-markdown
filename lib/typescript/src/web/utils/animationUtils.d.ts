import type { MarkdownTextInputElement } from '../../MarkdownTextInput.web';
declare const ANIMATED_ELEMENT_TYPES: readonly ["spinner"];
type AnimatedElementType = (typeof ANIMATED_ELEMENT_TYPES)[number];
type AnimationTimes = {
    [key in AnimatedElementType]?: CSSNumberish[];
};
/** Gets the current times of all animated elements inside the input */
declare function getAnimationCurrentTimes(currentInput: MarkdownTextInputElement): AnimationTimes;
/** Updates the current times of all animated elements inside the input, to preserve their state between input rerenders */
declare function updateAnimationsTime(currentInput: MarkdownTextInputElement, animationTimes: AnimationTimes): void;
export { getAnimationCurrentTimes, updateAnimationsTime };
//# sourceMappingURL=animationUtils.d.ts.map