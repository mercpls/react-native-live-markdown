import { parseStringWithUnitToNumber } from '../../styleUtils';
import { createLoadingIndicator } from './loadingIndicator';
const INLINE_IMAGE_PREVIEW_DEBOUNCE_TIME_MS = 300;
const inlineImageDefaultStyles = {
  position: 'absolute',
  bottom: 0,
  left: 0
};
const timeoutMap = new Map();
function getImagePreviewElement(targetElement) {
  return Array.from((targetElement === null || targetElement === void 0 ? void 0 : targetElement.childNodes) || []).find(el => (el === null || el === void 0 ? void 0 : el.contentEditable) === 'false');
}
function handleOnLoad(currentInput, target, imageHref, markdownStyle, imageContainer, err) {
  var _markdownStyle$inline;
  let targetElement = target;

  // Update the target element if the input structure was changed while the image was loading and its content hasn't changed
  if (!targetElement.isConnected) {
    var _getImagePreviewEleme, _getImagePreviewEleme2;
    const currentElement = currentInput.querySelector(`[data-type="block"][data-id="${target.getAttribute('data-id')}"]`);
    const currentElementURL = (_getImagePreviewEleme = getImagePreviewElement(currentElement)) === null || _getImagePreviewEleme === void 0 ? void 0 : _getImagePreviewEleme.getAttribute('data-url');
    const targetElementURL = (_getImagePreviewEleme2 = getImagePreviewElement(targetElement)) === null || _getImagePreviewEleme2 === void 0 ? void 0 : _getImagePreviewEleme2.getAttribute('data-url');
    if (currentElementURL && targetElementURL && currentElementURL === targetElementURL) {
      targetElement = currentElement;
    } else {
      return; // Prevent adding expired image previews to the input structure
    }
  }

  // Verify if the current spinner is for the loaded image. If not, it means that the response came after the user changed the image url
  const currentSpinner = currentInput.querySelector(`[data-type="spinner"][data-url="${imageHref}"]`);

  // Remove the spinner
  if (currentSpinner) {
    currentSpinner.remove();
  }
  const img = imageContainer.firstChild;
  const {
    minHeight,
    minWidth,
    maxHeight,
    maxWidth,
    borderRadius
  } = markdownStyle.inlineImage || {};
  const imgStyle = {
    minHeight,
    minWidth,
    maxHeight,
    maxWidth,
    borderRadius
  };

  // Set the image styles
  Object.assign(imageContainer.style, {
    ...inlineImageDefaultStyles,
    ...(err && {
      ...imgStyle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    })
  });
  Object.assign(img.style, !err && imgStyle);
  targetElement.appendChild(imageContainer);
  const currentInputElement = currentInput;
  if (currentInput.imageElements) {
    currentInputElement.imageElements.push(img);
  } else {
    currentInputElement.imageElements = [img];
  }
  const imageClientHeight = Math.max(img.clientHeight, imageContainer.clientHeight);
  Object.assign(imageContainer.style, {
    height: `${imageClientHeight}px`
  });
  // Set paddingBottom to the height of the image so it's displayed under the block
  const imageMarginTop = parseStringWithUnitToNumber(`${(_markdownStyle$inline = markdownStyle.inlineImage) === null || _markdownStyle$inline === void 0 ? void 0 : _markdownStyle$inline.marginTop}`);
  Object.assign(targetElement.style, {
    paddingBottom: `${imageClientHeight + imageMarginTop}px`
  });
}
function createImageElement(currentInput, targetNode, url, markdownStyle) {
  if (timeoutMap.has(targetNode.orderIndex)) {
    const mapItem = timeoutMap.get(targetNode.orderIndex);
    // Check if the image URL has been changed, if not, early return so the image can be loaded asynchronously
    const currentElement = currentInput.querySelector(`[data-type="block"][data-id="${targetNode.orderIndex}"]`);
    if ((mapItem === null || mapItem === void 0 ? void 0 : mapItem.url) === url && currentElement && getImagePreviewElement(currentElement)) {
      return;
    }
    clearTimeout(mapItem === null || mapItem === void 0 ? void 0 : mapItem.timeout);
    timeoutMap.delete(targetNode.orderIndex);
  }
  const timeout = setTimeout(() => {
    const imageContainer = document.createElement('span');
    imageContainer.contentEditable = 'false';
    imageContainer.setAttribute('data-type', 'inline-container');
    const img = new Image();
    imageContainer.appendChild(img);
    img.contentEditable = 'false';
    img.onload = () => handleOnLoad(currentInput, targetNode.element, url, markdownStyle, imageContainer);
    img.onerror = err => handleOnLoad(currentInput, targetNode.element, url, markdownStyle, imageContainer, err);
    img.src = url;
    timeoutMap.delete(targetNode.orderIndex);
  }, INLINE_IMAGE_PREVIEW_DEBOUNCE_TIME_MS);
  timeoutMap.set(targetNode.orderIndex, {
    timeout,
    url
  });
}

/** Adds already loaded image element from current input content to the tree node */
function updateImageTreeNode(targetNode, newElement, imageMarginTop = 0) {
  const paddingBottom = `${parseStringWithUnitToNumber(newElement.style.height) + imageMarginTop}px`;
  targetNode.element.appendChild(newElement.cloneNode(true));
  let currentParent = targetNode.element;
  while (currentParent.parentElement && !['line', 'block'].includes(currentParent.getAttribute('data-type') || '')) {
    currentParent = currentParent.parentElement;
  }
  Object.assign(currentParent.style, {
    paddingBottom
  });
  return targetNode;
}

/** The main function that adds inline image preview to the node */
function addInlineImagePreview(currentInput, targetNode, text, ranges, markdownStyle, inlineImagesProps) {
  var _markdownStyle$inline2, _markdownStyle$inline3, _currentInput$imageEl, _markdownStyle$loadin, _markdownStyle$loadin2;
  const {
    addAuthTokenToImageURLCallback,
    imagePreviewAuthRequiredURLs
  } = inlineImagesProps;
  const linkRange = ranges.find(r => r.type === 'link');
  let imageHref = '';
  if (linkRange) {
    imageHref = text.substring(linkRange.start, linkRange.start + linkRange.length);
    if (addAuthTokenToImageURLCallback && imagePreviewAuthRequiredURLs && imagePreviewAuthRequiredURLs.find(url => imageHref.startsWith(url))) {
      imageHref = addAuthTokenToImageURLCallback(imageHref);
    }
  }
  const imageMarginTop = parseStringWithUnitToNumber(`${(_markdownStyle$inline2 = markdownStyle.inlineImage) === null || _markdownStyle$inline2 === void 0 ? void 0 : _markdownStyle$inline2.marginTop}`);
  const imageMarginBottom = parseStringWithUnitToNumber(`${(_markdownStyle$inline3 = markdownStyle.inlineImage) === null || _markdownStyle$inline3 === void 0 ? void 0 : _markdownStyle$inline3.marginBottom}`);

  // If the inline image markdown with the same href exists in the current input, use it instead of creating new one.
  // Prevents from image flickering and layout jumps
  const alreadyLoadedPreview = (_currentInput$imageEl = currentInput.imageElements) === null || _currentInput$imageEl === void 0 ? void 0 : _currentInput$imageEl.find(el => (el === null || el === void 0 ? void 0 : el.src) === imageHref);
  const loadedImageContainer = alreadyLoadedPreview === null || alreadyLoadedPreview === void 0 ? void 0 : alreadyLoadedPreview.parentElement;
  if (loadedImageContainer && loadedImageContainer.getAttribute('data-type') === 'inline-container') {
    return updateImageTreeNode(targetNode, loadedImageContainer, imageMarginTop);
  }

  // Add a loading spinner
  const spinner = createLoadingIndicator(imageHref, markdownStyle);
  if (spinner) {
    targetNode.element.appendChild(spinner);
  }
  Object.assign(targetNode.element.style, {
    display: 'block',
    marginBottom: `${imageMarginBottom}px`,
    paddingBottom: ((_markdownStyle$loadin = markdownStyle.loadingIndicatorContainer) === null || _markdownStyle$loadin === void 0 ? void 0 : _markdownStyle$loadin.height) || ((_markdownStyle$loadin2 = markdownStyle.loadingIndicator) === null || _markdownStyle$loadin2 === void 0 ? void 0 : _markdownStyle$loadin2.height) || !!markdownStyle.loadingIndicator && '30px' || undefined
  });
  createImageElement(currentInput, targetNode, imageHref, markdownStyle);
  return targetNode;
}
function forceRefreshAllImages(currentInput, markdownStyle) {
  currentInput.querySelectorAll('img').forEach(img => {
    // force image reload only if broken image icon is displayed
    if (img.naturalWidth > 0) {
      return;
    }
    const url = img.src;
    const imgElement = img;
    imgElement.src = '';
    imgElement.onload = () => {
      var _img$parentElement;
      return handleOnLoad(currentInput, (_img$parentElement = img.parentElement) === null || _img$parentElement === void 0 ? void 0 : _img$parentElement.parentElement, url, markdownStyle, img.parentElement);
    };
    imgElement.src = `${url}#`;
  });
}

// eslint-disable-next-line import/prefer-default-export
export { addInlineImagePreview, forceRefreshAllImages };
//# sourceMappingURL=inlineImage.js.map