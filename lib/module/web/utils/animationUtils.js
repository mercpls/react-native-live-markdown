const ANIMATED_ELEMENT_TYPES = ['spinner'];
const KEYFRAMES = {
  spinner: [{
    transform: 'rotate(0deg)'
  }, {
    transform: 'rotate(360deg)'
  }]
};
const OPTIONS = {
  spinner: {
    duration: 1000,
    iterations: Infinity
  }
};

/** Gets the current times of all animated elements inside the input */
function getAnimationCurrentTimes(currentInput) {
  const animationTimes = {};
  ANIMATED_ELEMENT_TYPES.forEach(type => {
    const elements = currentInput.querySelectorAll(`[data-type="${type}"]`);
    animationTimes[type] = Array.from(elements).map(element => {
      const animation = element.firstChild.getAnimations()[0];
      if (animation) {
        return animation.currentTime || 0;
      }
      return 0;
    });
  });
  return animationTimes;
}

/** Updates the current times of all animated elements inside the input, to preserve their state between input rerenders */
function updateAnimationsTime(currentInput, animationTimes) {
  ANIMATED_ELEMENT_TYPES.forEach(type => {
    const elements = currentInput.querySelectorAll(`[data-type="${type}"]`);
    if (!KEYFRAMES[type]) {
      return;
    }
    elements.forEach((element, index) => {
      const animation = element.firstChild.animate(KEYFRAMES[type], OPTIONS[type]);
      if (animationTimes !== null && animationTimes !== void 0 && animationTimes[type] && animation) {
        var _animationTimes$type;
        animation.currentTime = ((_animationTimes$type = animationTimes[type]) === null || _animationTimes$type === void 0 ? void 0 : _animationTimes$type[index]) || 0;
      }
    });
  });
}
export { getAnimationCurrentTimes, updateAnimationsTime };
//# sourceMappingURL=animationUtils.js.map