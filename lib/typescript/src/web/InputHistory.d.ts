/// <reference types="node" />
type HistoryItem = {
    text: string;
    cursorPosition: number | null;
};
export default class InputHistory {
    depth: number;
    items: HistoryItem[];
    historyIndex: number;
    currentText: string | null;
    timeout: NodeJS.Timeout | null;
    debounceTime: number;
    constructor(depth: number, debounceTime?: number, startingText?: string);
    getCurrentItem(): HistoryItem | null;
    setHistory(newHistory: HistoryItem[]): void;
    setHistoryIndex(index: number): void;
    clear(): void;
    throttledAdd(text: string, cursorPosition: number): void;
    stopTimeout(): void;
    add(text: string, cursorPosition: number): void;
    undo(): HistoryItem | null;
    redo(): HistoryItem | null;
}
export {};
//# sourceMappingURL=InputHistory.d.ts.map