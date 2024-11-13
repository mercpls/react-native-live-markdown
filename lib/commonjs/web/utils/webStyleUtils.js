"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseToReactDOMStyle = parseToReactDOMStyle;
exports.processMarkdownStyle = processMarkdownStyle;
var _styleUtils = require("../../styleUtils");
/* eslint-disable @typescript-eslint/no-explicit-any */

let createReactDOMStyle;
try {
  createReactDOMStyle =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('react-native-web/dist/exports/StyleSheet/compiler/createReactDOMStyle').default;
} catch (e) {
  throw new Error('[react-native-live-markdown] Function `createReactDOMStyle` from react-native-web not found. Please make sure that you are using React Native Web 0.18 or newer.');
}
let preprocessStyle;
try {
  preprocessStyle =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('react-native-web/dist/exports/StyleSheet/preprocess').default;
} catch (e) {
  throw new Error('[react-native-live-markdown] Function `preprocessStyle` from react-native-web not found.');
}
let dangerousStyleValue;
try {
  dangerousStyleValue =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('react-native-web/dist/modules/setValueForStyles/dangerousStyleValue').default;
} catch (e) {
  throw new Error('[react-native-live-markdown] Function `dangerousStyleValue` from react-native-web not found.');
}
function processUnitsInMarkdownStyle(input) {
  const output = JSON.parse(JSON.stringify(input));
  Object.keys(output).forEach(key => {
    const obj = output[key];
    Object.keys(obj).forEach(prop => {
      obj[prop] = dangerousStyleValue(prop, obj[prop], false);
    });
  });
  return output;
}
function processMarkdownStyle(input) {
  return processUnitsInMarkdownStyle((0, _styleUtils.mergeMarkdownStyleWithDefault)(input));
}
function parseToReactDOMStyle(style) {
  return createReactDOMStyle(preprocessStyle(style));
}
//# sourceMappingURL=webStyleUtils.js.map