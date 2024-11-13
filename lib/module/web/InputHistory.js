export default class InputHistory {
  currentText = null;
  timeout = null;
  constructor(depth, debounceTime = 150, startingText = '') {
    this.depth = depth;
    this.items = [{
      text: startingText,
      cursorPosition: startingText.length
    }];
    this.historyIndex = 0;
    this.debounceTime = debounceTime;
  }
  getCurrentItem() {
    return this.items[this.historyIndex] || null;
  }
  setHistory(newHistory) {
    this.items = newHistory.slice(newHistory.length - this.depth);
    this.historyIndex = newHistory.length - 1;
  }
  setHistoryIndex(index) {
    this.historyIndex = index;
  }
  clear() {
    this.items = [];
    this.historyIndex = 0;
  }
  throttledAdd(text, cursorPosition) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.currentText === null) {
      this.timeout = null;
      this.add(text, cursorPosition);
    } else {
      this.items[this.historyIndex] = {
        text,
        cursorPosition
      };
    }
    this.currentText = text;
    this.timeout = setTimeout(() => {
      this.currentText = null;
    }, this.debounceTime);
  }
  stopTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.currentText = null;
  }
  add(text, cursorPosition) {
    if (this.items.length > 0) {
      const currentItem = this.items[this.historyIndex];
      if (currentItem && text === currentItem.text) {
        return;
      }
    }
    if (this.historyIndex < this.items.length - 1) {
      this.items.splice(this.historyIndex + 1);
      this.historyIndex = this.items.length - 1;
    }
    this.items.push({
      text,
      cursorPosition
    });
    if (this.items.length > this.depth) {
      this.items.shift();
    } else {
      this.historyIndex += 1;
    }
  }
  undo() {
    this.stopTimeout();
    if (this.items.length === 0 || this.historyIndex - 1 < 0) {
      return null;
    }
    const currentHistoryItem = this.items[this.historyIndex];
    const previousHistoryItem = this.items[this.historyIndex - 1];
    const undoItem = previousHistoryItem ? {
      text: previousHistoryItem.text,
      cursorPosition: Math.min(((currentHistoryItem === null || currentHistoryItem === void 0 ? void 0 : currentHistoryItem.cursorPosition) ?? 0) - (((currentHistoryItem === null || currentHistoryItem === void 0 ? void 0 : currentHistoryItem.text) ?? '').length - ((previousHistoryItem === null || previousHistoryItem === void 0 ? void 0 : previousHistoryItem.text) ?? '').length), ((previousHistoryItem === null || previousHistoryItem === void 0 ? void 0 : previousHistoryItem.text) ?? '').length)
    } : null;
    if (this.historyIndex > 0) {
      this.historyIndex -= 1;
    }
    return undoItem;
  }
  redo() {
    if (this.currentText !== null && this.timeout) {
      this.stopTimeout();
    }
    if (this.items.length === 0 || this.historyIndex + 1 > this.items.length) {
      return null;
    }
    if (this.historyIndex < this.items.length - 1) {
      this.historyIndex += 1;
    } else {
      return null;
    }
    return this.items[this.historyIndex] || null;
  }
}
//# sourceMappingURL=InputHistory.js.map