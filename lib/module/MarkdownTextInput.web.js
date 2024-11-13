/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
import { updateInputStructure } from './web/utils/parserUtils';
import InputHistory from './web/InputHistory';
import { getCurrentCursorPosition, removeSelection, setCursorPosition } from './web/utils/cursorUtils';
import './web/MarkdownTextInput.css';
import { getElementHeight, getPlaceholderValue, isEventComposing, normalizeValue, parseInnerHTMLToText } from './web/utils/inputUtils';
import { parseToReactDOMStyle, processMarkdownStyle } from './web/utils/webStyleUtils';
import { forceRefreshAllImages } from './web/inputElements/inlineImage';
require('../parser/react-native-live-markdown-parser.js');
const useClientEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
let focusTimeout = null;
const MarkdownTextInput = /*#__PURE__*/React.forwardRef(({
  accessibilityLabel,
  accessibilityLabelledBy,
  accessibilityRole,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  blurOnSubmit = false,
  clearTextOnFocus,
  dir = 'auto',
  disabled = false,
  numberOfLines,
  multiline = false,
  markdownStyle,
  onBlur,
  onChange,
  onChangeText,
  onClick,
  onFocus,
  onKeyPress,
  onSelectionChange,
  onSubmitEditing,
  placeholder,
  placeholderTextColor = `rgba(0,0,0,0.2)`,
  selectTextOnFocus,
  spellCheck,
  selection,
  style = {},
  value,
  autoFocus = false,
  onContentSizeChange,
  id,
  inputMode,
  onTouchStart,
  maxLength,
  addAuthTokenToImageURLCallback,
  imagePreviewAuthRequiredURLs
}, ref) => {
  const compositionRef = useRef(false);
  const divRef = useRef(null);
  const currentlyFocusedField = useRef(null);
  const contentSelection = useRef(null);
  const className = `react-native-live-markdown-input-${multiline ? 'multiline' : 'singleline'}`;
  const history = useRef();
  const dimensions = useRef(null);
  const pasteContent = useRef(null);
  const hasJustBeenFocused = useRef(false);
  if (!history.current) {
    history.current = new InputHistory(100, 150, value || '');
  }
  const flattenedStyle = useMemo(() => StyleSheet.flatten(style), [style]);

  // Empty placeholder would collapse the div, so we need to use zero-width space to prevent it
  const heightSafePlaceholder = useMemo(() => getPlaceholderValue(placeholder), [placeholder]);
  const setEventProps = useCallback(e => {
    if (divRef.current) {
      const text = divRef.current.value;
      if (e.target) {
        // TODO: change the logic here so every event have value property
        e.target.value = text;
      }
      if (e.nativeEvent && e.nativeEvent.text) {
        e.nativeEvent.text = text;
      }
    }
    return e;
  }, []);
  const parseText = useCallback((target, text, customMarkdownStyles, cursorPosition = null, shouldAddToHistory = true, shouldForceDOMUpdate = false, shouldScrollIntoView = false) => {
    if (!divRef.current) {
      return {
        text: text || '',
        cursorPosition: null
      };
    }
    if (text === null) {
      return {
        text: divRef.current.value,
        cursorPosition: null
      };
    }
    const parsedText = updateInputStructure(target, text, cursorPosition, multiline, customMarkdownStyles, false, shouldForceDOMUpdate, shouldScrollIntoView, {
      addAuthTokenToImageURLCallback,
      imagePreviewAuthRequiredURLs
    });
    divRef.current.value = parsedText.text;
    if (history.current && shouldAddToHistory) {
      history.current.throttledAdd(parsedText.text, parsedText.cursorPosition);
    }
    return parsedText;
  }, [addAuthTokenToImageURLCallback, imagePreviewAuthRequiredURLs, multiline]);
  const processedMarkdownStyle = useMemo(() => {
    const newMarkdownStyle = processMarkdownStyle(markdownStyle);
    if (divRef.current) {
      parseText(divRef.current, divRef.current.value, newMarkdownStyle, null, false, false);
    }
    return newMarkdownStyle;
  }, [markdownStyle, parseText]);
  const inputStyles = useMemo(() => StyleSheet.flatten([styles.defaultInputStyles, flattenedStyle && {
    caretColor: flattenedStyle.color || 'black'
  }, {
    whiteSpace: multiline ? 'pre-wrap' : 'nowrap'
  }, disabled && styles.disabledInputStyles, parseToReactDOMStyle(flattenedStyle)]), [flattenedStyle, multiline, disabled]);
  const undo = useCallback(target => {
    if (!history.current) {
      return {
        text: '',
        cursorPosition: 0
      };
    }
    const item = history.current.undo();
    const undoValue = item ? item.text : null;
    return parseText(target, undoValue, processedMarkdownStyle, item ? item.cursorPosition : null, false);
  }, [parseText, processedMarkdownStyle]);
  const redo = useCallback(target => {
    if (!history.current) {
      return {
        text: '',
        cursorPosition: 0
      };
    }
    const item = history.current.redo();
    const redoValue = item ? item.text : null;
    return parseText(target, redoValue, processedMarkdownStyle, item ? item.cursorPosition : null, false);
  }, [parseText, processedMarkdownStyle]);

  // Placeholder text color logic
  const updateTextColor = useCallback((node, text) => {
    // eslint-disable-next-line no-param-reassign -- we need to change the style of the node, so we need to modify it
    node.style.color = String(placeholder && (text === '' || text === '\n') ? placeholderTextColor : flattenedStyle.color || 'black');
  }, [flattenedStyle.color, placeholder, placeholderTextColor]);
  const handleSelectionChange = useCallback(event => {
    const e = event;
    setEventProps(e);
    if (onSelectionChange && contentSelection.current) {
      e.nativeEvent.selection = contentSelection.current;
      onSelectionChange(e);
    }
  }, [onSelectionChange, setEventProps]);
  const updateRefSelectionVariables = useCallback(newSelection => {
    if (!divRef.current) {
      return;
    }
    const {
      start,
      end
    } = newSelection;
    divRef.current.selection = {
      start,
      end
    };
  }, []);
  const updateSelection = useCallback((e, predefinedSelection = null) => {
    if (!divRef.current) {
      return;
    }
    const newSelection = predefinedSelection || getCurrentCursorPosition(divRef.current);
    if (newSelection && (!contentSelection.current || contentSelection.current.start !== newSelection.start || contentSelection.current.end !== newSelection.end)) {
      updateRefSelectionVariables(newSelection);
      contentSelection.current = newSelection;
      handleSelectionChange(e);
    }
  }, [handleSelectionChange, updateRefSelectionVariables]);
  const handleOnSelect = useCallback(e => {
    updateSelection(e);

    // If the input has just been focused, we need to scroll the cursor into view
    if (divRef.current && contentSelection.current && hasJustBeenFocused.current) {
      var _contentSelection$cur, _contentSelection$cur2;
      setCursorPosition(divRef.current, (_contentSelection$cur = contentSelection.current) === null || _contentSelection$cur === void 0 ? void 0 : _contentSelection$cur.start, (_contentSelection$cur2 = contentSelection.current) === null || _contentSelection$cur2 === void 0 ? void 0 : _contentSelection$cur2.end, true);
      hasJustBeenFocused.current = false;
    }
  }, [updateSelection]);
  const handleContentSizeChange = useCallback(() => {
    var _dimensions$current;
    if (!divRef.current || !multiline || !onContentSizeChange) {
      return;
    }
    const {
      offsetWidth: newWidth,
      offsetHeight: newHeight
    } = divRef.current;
    if (newHeight !== ((_dimensions$current = dimensions.current) === null || _dimensions$current === void 0 ? void 0 : _dimensions$current.height) || newWidth !== dimensions.current.width) {
      dimensions.current = {
        height: newHeight,
        width: newWidth
      };
      onContentSizeChange({
        nativeEvent: {
          contentSize: dimensions.current
        }
      });
    }
  }, [multiline, onContentSizeChange]);
  const handleOnChangeText = useCallback(e => {
    if (!divRef.current || !(e.target instanceof HTMLElement) || !contentSelection.current) {
      return;
    }
    const nativeEvent = e.nativeEvent;
    const inputType = nativeEvent.inputType;
    updateTextColor(divRef.current, e.target.textContent ?? '');
    const previousText = divRef.current.value;
    let parsedText = normalizeValue(inputType === 'pasteText' ? pasteContent.current || '' : parseInnerHTMLToText(e.target, contentSelection.current.start, inputType));
    if (pasteContent.current) {
      pasteContent.current = null;
    }
    if (maxLength !== undefined && parsedText.length > maxLength) {
      parsedText = previousText;
    }
    const prevSelection = contentSelection.current ?? {
      start: 0,
      end: 0
    };
    const newCursorPosition = inputType === 'deleteContentForward' && contentSelection.current.start === contentSelection.current.end ? Math.max(contentSelection.current.start, 0) // Don't move the caret when deleting forward with no characters selected
    : Math.max(Math.max(contentSelection.current.end, 0) + (parsedText.length - previousText.length), 0);
    if (compositionRef.current) {
      updateTextColor(divRef.current, parsedText);
      updateSelection(e, {
        start: newCursorPosition,
        end: newCursorPosition
      });
      divRef.current.value = parsedText;
      if (onChangeText) {
        onChangeText(parsedText);
      }
      return;
    }
    let newInputUpdate;
    switch (inputType) {
      case 'historyUndo':
        newInputUpdate = undo(divRef.current);
        break;
      case 'historyRedo':
        newInputUpdate = redo(divRef.current);
        break;
      default:
        newInputUpdate = parseText(divRef.current, parsedText, processedMarkdownStyle, newCursorPosition, true, !inputType, inputType === 'pasteText');
    }
    const {
      text,
      cursorPosition
    } = newInputUpdate;
    updateTextColor(divRef.current, text);
    updateSelection(e, {
      start: cursorPosition ?? 0,
      end: cursorPosition ?? 0
    });
    if (onChange) {
      const event = e;
      setEventProps(event);

      // The new text is between the prev start selection and the new end selection, can be empty
      const addedText = text.slice(prevSelection.start, cursorPosition ?? 0);
      // The length of the text that replaced the before text
      const count = addedText.length;
      // The start index of the replacement operation
      let start = prevSelection.start;
      const prevSelectionRange = prevSelection.end - prevSelection.start;
      // The length the deleted text had before
      let before = prevSelectionRange;
      if (prevSelectionRange === 0 && (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward')) {
        // its possible the user pressed a delete key without a selection range, so we need to adjust the before value to have the length of the deleted text
        before = previousText.length - text.length;
      }
      if (inputType === 'deleteContentBackward') {
        // When the user does a backspace delete he expects the content before the cursor to be removed.
        // For this the start value needs to be adjusted (its as if the selection was before the text that we want to delete)
        start = Math.max(start - before, 0);
      }
      event.nativeEvent.count = count;
      event.nativeEvent.before = before;
      event.nativeEvent.start = start;

      // @ts-expect-error TODO: Remove once react native PR merged https://github.com/facebook/react-native/pull/45248
      onChange(event);
    }
    if (onChangeText) {
      onChangeText(text);
    }
    handleContentSizeChange();
  }, [updateTextColor, updateSelection, onChange, onChangeText, handleContentSizeChange, undo, redo, parseText, processedMarkdownStyle, setEventProps, maxLength]);
  const insertText = useCallback((e, text) => {
    if (!contentSelection.current || !divRef.current) {
      return;
    }
    const previousText = divRef.current.value;
    let insertedText = text;
    let availableLength = text.length;
    const prefix = divRef.current.value.substring(0, contentSelection.current.start);
    const suffix = divRef.current.value.substring(contentSelection.current.end);
    if (maxLength !== undefined) {
      availableLength = maxLength - prefix.length - suffix.length;
      insertedText = text.slice(0, Math.max(availableLength, 0));
    }
    const newText = `${prefix}${insertedText}${suffix}`;
    if (previousText === newText) {
      document.execCommand('delete');
    }
    pasteContent.current = availableLength > 0 ? newText : previousText;
    e.nativeEvent.inputType = 'pasteText';
    handleOnChangeText(e);
  }, [handleOnChangeText, maxLength]);
  const handleKeyPress = useCallback(e => {
    if (!divRef.current) {
      return;
    }
    const hostNode = e.target;
    e.stopPropagation();
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const nativeEvent = e.nativeEvent;
      if (e.shiftKey) {
        nativeEvent.inputType = 'historyRedo';
      } else {
        nativeEvent.inputType = 'historyUndo';
      }
      handleOnChangeText(e);
      return;
    }
    const blurOnSubmitDefault = !multiline;
    const shouldBlurOnSubmit = blurOnSubmit === null ? blurOnSubmitDefault : blurOnSubmit;
    const nativeEvent = e.nativeEvent;
    const isComposing = isEventComposing(nativeEvent);
    const event = e;
    setEventProps(event);
    if (onKeyPress) {
      onKeyPress(event);
    }
    if (e.key === 'Enter' &&
    // Do not call submit if composition is occuring.
    !isComposing && !e.isDefaultPrevented()) {
      // prevent "Enter" from inserting a newline or submitting a form
      e.preventDefault();
      if (!e.shiftKey && (blurOnSubmit || !multiline) && onSubmitEditing) {
        onSubmitEditing(event);
      } else if (multiline) {
        //   We need to change normal behavior of "Enter" key to insert a line breaks, to prevent wrapping contentEditable text in <div> tags.
        //  Thanks to that in every situation we have proper amount of new lines in our parsed text. Without it pressing enter in empty lines will add 2 more new lines.
        insertText(e, '\n');
      }
      if (!e.shiftKey && (shouldBlurOnSubmit && hostNode !== null || !multiline)) {
        setTimeout(() => divRef.current && divRef.current.blur(), 0);
      }
    }
  }, [multiline, blurOnSubmit, setEventProps, onKeyPress, handleOnChangeText, onSubmitEditing, insertText]);
  const handleFocus = useCallback(event => {
    hasJustBeenFocused.current = true;
    const e = event;
    const hostNode = e.target;
    currentlyFocusedField.current = hostNode;
    setEventProps(e);
    if (divRef.current) {
      if (contentSelection.current) {
        setCursorPosition(divRef.current, contentSelection.current.start, contentSelection.current.end);
      } else {
        const valueLength = value ? value.length : (divRef.current.value || '').length;
        setCursorPosition(divRef.current, valueLength, null);
      }
    }
    if (divRef.current) {
      divRef.current.scrollIntoView({
        block: 'nearest'
      });
    }
    if (onFocus) {
      setEventProps(e);
      onFocus(e);
    }
    if (hostNode !== null) {
      if (clearTextOnFocus && divRef.current) {
        divRef.current.textContent = '';
      }
      if (selectTextOnFocus) {
        // Safari requires selection to occur in a setTimeout
        if (focusTimeout !== null) {
          clearTimeout(focusTimeout);
        }
        focusTimeout = setTimeout(() => {
          if (hostNode === null) {
            return;
          }
          document.execCommand('selectAll', false, '');
        }, 0);
      }
    }
  }, [clearTextOnFocus, onFocus, selectTextOnFocus, setEventProps, value]);
  const handleBlur = useCallback(event => {
    const e = event;
    removeSelection();
    currentlyFocusedField.current = null;
    if (onBlur) {
      setEventProps(e);
      onBlur(e);
    }
  }, [onBlur, setEventProps]);
  const handleClick = useCallback(e => {
    if (!onClick || !divRef.current) {
      return;
    }
    e.target.value = divRef.current.value;
    onClick(e);
  }, [onClick]);
  const handleCopy = useCallback(e => {
    var _divRef$current;
    if (!divRef.current || !contentSelection.current) {
      return;
    }
    e.preventDefault();
    const text = (_divRef$current = divRef.current) === null || _divRef$current === void 0 ? void 0 : _divRef$current.value.substring(contentSelection.current.start, contentSelection.current.end);
    e.clipboardData.setData('text/plain', text ?? '');
  }, []);
  const handleCut = useCallback(e => {
    if (!divRef.current || !contentSelection.current) {
      return;
    }
    handleCopy(e);
    if (contentSelection.current.start !== contentSelection.current.end) {
      document.execCommand('delete');
    }
  }, [handleCopy]);
  const handlePaste = useCallback(e => {
    if (e.isDefaultPrevented() || !divRef.current || !contentSelection.current) {
      return;
    }
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const text = clipboardData.getData('text/plain');
    insertText(e, text);
  }, [insertText]);
  const startComposition = useCallback(() => {
    compositionRef.current = true;
  }, []);
  const endComposition = useCallback(e => {
    compositionRef.current = false;
    handleOnChangeText(e);
  }, [handleOnChangeText]);
  const setRef = currentRef => {
    const r = currentRef;
    if (r) {
      r.isFocused = () => document.activeElement === r;
      r.clear = () => {
        r.textContent = '';
        updateTextColor(r, '');
      };
      if (value === '' || value === undefined) {
        // update to placeholder color when value is empty
        updateTextColor(r, r.textContent ?? '');
      }
    }
    if (ref) {
      if (typeof ref === 'object') {
        // eslint-disable-next-line no-param-reassign
        ref.current = r;
      } else if (typeof ref === 'function') {
        ref(r);
      }
    }
    divRef.current = r;
  };
  const handleTouchStart = event => {
    if (!onTouchStart) {
      return;
    }
    const e = event;
    onTouchStart(e);
  };
  useClientEffect(function parseAndStyleValue() {
    if (!divRef.current || value === divRef.current.value) {
      return;
    }
    if (value === undefined) {
      parseText(divRef.current, divRef.current.value, processedMarkdownStyle);
      return;
    }
    const normalizedValue = normalizeValue(value);
    divRef.current.value = normalizedValue;
    parseText(divRef.current, normalizedValue, processedMarkdownStyle, null, true, false, true);
    updateTextColor(divRef.current, value);
  }, [multiline, processedMarkdownStyle, value, maxLength]);
  useClientEffect(function adjustHeight() {
    if (!divRef.current || !multiline) {
      return;
    }
    const elementHeight = getElementHeight(divRef.current, inputStyles, numberOfLines);
    divRef.current.style.height = elementHeight;
    divRef.current.style.maxHeight = elementHeight;
  }, [numberOfLines]);
  useEffect(() => {
    if (!divRef.current) {
      return;
    }
    // focus the input on mount if autoFocus is set
    if (autoFocus) {
      divRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    // update content size when the input styles change
    handleContentSizeChange();
  }, [handleContentSizeChange, inputStyles]);
  useEffect(() => {
    if (!divRef.current || !selection || contentSelection.current && selection.start === contentSelection.current.start && selection.end === contentSelection.current.end) {
      return;
    }
    const newSelection = {
      start: selection.start,
      end: selection.end ?? selection.start
    };
    contentSelection.current = newSelection;
    updateRefSelectionVariables(newSelection);
    setCursorPosition(divRef.current, newSelection.start, newSelection.end);
  }, [selection, updateRefSelectionVariables]);
  useEffect(() => {
    const handleReconnect = () => {
      forceRefreshAllImages(divRef.current, processedMarkdownStyle);
    };
    window.addEventListener('online', handleReconnect);
    return () => {
      window.removeEventListener('online', handleReconnect);
    };
  }, [processedMarkdownStyle]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    React.createElement("div", {
      id: id,
      ref: setRef,
      contentEditable: !disabled,
      style: inputStyles,
      role: accessibilityRole || 'textbox',
      "aria-label": accessibilityLabel,
      "aria-labelledby": `${accessibilityLabelledBy}`,
      "aria-placeholder": heightSafePlaceholder,
      "aria-multiline": multiline,
      autoCorrect: autoCorrect ? 'on' : 'off',
      autoCapitalize: autoCapitalize,
      className: className,
      onKeyDown: handleKeyPress,
      onCompositionStart: startComposition,
      onCompositionEnd: endComposition,
      onInput: handleOnChangeText,
      onClick: handleClick,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onCopy: handleCopy,
      onCut: handleCut,
      onPaste: handlePaste,
      placeholder: heightSafePlaceholder,
      spellCheck: spellCheck,
      dir: dir,
      inputMode: inputMode,
      onSelect: handleOnSelect,
      onTouchStart: handleTouchStart
    })
  );
});
const styles = StyleSheet.create({
  defaultInputStyles: {
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: 'solid',
    fontFamily: 'sans-serif',
    // @ts-expect-error it works on web
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'auto',
    overflowWrap: 'break-word'
  },
  disabledInputStyles: {
    opacity: 0.75,
    cursor: 'auto'
  }
});
export default MarkdownTextInput;
//# sourceMappingURL=MarkdownTextInput.web.js.map