"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeMarkdownStyleWithDefault = mergeMarkdownStyleWithDefault;
exports.parseStringWithUnitToNumber = parseStringWithUnitToNumber;
var _reactNative = require("react-native");
const FONT_FAMILY_MONOSPACE = _reactNative.Platform.select({
  ios: 'Courier',
  default: 'monospace'
});
function makeDefaultMarkdownStyle() {
  return {
    syntax: {
      color: 'gray'
    },
    link: {
      color: 'blue'
    },
    h1: {
      fontSize: 25
    },
    emoji: {
      fontSize: 20
    },
    blockquote: {
      borderColor: 'gray',
      borderWidth: 6,
      marginLeft: 6,
      paddingLeft: 6
    },
    code: {
      fontFamily: FONT_FAMILY_MONOSPACE,
      fontSize: 20,
      color: 'black',
      backgroundColor: 'lightgray'
    },
    pre: {
      fontFamily: FONT_FAMILY_MONOSPACE,
      fontSize: 20,
      color: 'black',
      backgroundColor: 'lightgray'
    },
    mentionHere: {
      color: 'green',
      backgroundColor: 'lime'
    },
    mentionUser: {
      color: 'blue',
      backgroundColor: 'cyan'
    },
    mentionReport: {
      color: 'red',
      backgroundColor: 'pink'
    },
    inlineImage: {
      minWidth: 50,
      minHeight: 50,
      maxWidth: 150,
      maxHeight: 150,
      marginTop: 5,
      marginBottom: 0,
      borderRadius: 5
    },
    loadingIndicator: {
      primaryColor: 'gray',
      secondaryColor: 'lightgray'
    }
  };
}
function mergeMarkdownStyleWithDefault(input) {
  const output = makeDefaultMarkdownStyle();
  if (input !== undefined) {
    Object.keys(input).forEach(key => {
      if (!(key in output)) {
        return;
      }
      const outputValue = output[key];
      if (outputValue) {
        Object.assign(outputValue, input[key]);
      }
    });
  }
  return output;
}
function parseStringWithUnitToNumber(value) {
  return value ? parseInt(value.replace('px', ''), 10) : 0;
}
//# sourceMappingURL=styleUtils.js.map