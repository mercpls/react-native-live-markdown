"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createLoadingIndicator = createLoadingIndicator;
const spinnerDefaultStyles = {
  borderRadius: '50%',
  display: 'block',
  animationPlayState: 'paused'
};
const spinnerContainerDefaultStyles = {
  position: 'absolute',
  bottom: '0',
  left: '0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

/** Creates animated loading spinner */
function createLoadingIndicator(url, markdownStyle) {
  const container = document.createElement('span');
  container.contentEditable = 'false';
  const spinner = document.createElement('span');
  const spinnerStyles = markdownStyle.loadingIndicator;
  if (spinnerStyles) {
    const spinnerBorderWidth = spinnerStyles.borderWidth || 3;
    Object.assign(spinner.style, {
      ...spinnerDefaultStyles,
      border: `${spinnerBorderWidth}px solid ${String(spinnerStyles.secondaryColor)}`,
      borderTop: `${spinnerBorderWidth}px solid ${String(spinnerStyles.primaryColor)}`,
      width: spinnerStyles.width || '20px',
      height: spinnerStyles.height || '20px'
    });
  }
  const containerStyles = markdownStyle.loadingIndicatorContainer;
  Object.assign(container.style, {
    ...markdownStyle.loadingIndicatorContainer,
    ...spinnerContainerDefaultStyles,
    width: (containerStyles === null || containerStyles === void 0 ? void 0 : containerStyles.width) || 'auto',
    height: (containerStyles === null || containerStyles === void 0 ? void 0 : containerStyles.height) || 'auto'
  });
  container.setAttribute('data-type', 'spinner');
  container.setAttribute('data-url', url);
  container.contentEditable = 'false';
  container.appendChild(spinner);
  return container;
}

// eslint-disable-next-line import/prefer-default-export
//# sourceMappingURL=loadingIndicator.js.map