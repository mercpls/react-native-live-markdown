import type { HTMLMarkdownElement } from '../../MarkdownTextInput.web';
import type { MarkdownRange, MarkdownType } from '../../commonTypes';
type NodeType = MarkdownType | 'line' | 'text' | 'br' | 'block' | 'root';
type TreeNode = Omit<MarkdownRange, 'type'> & {
    element: HTMLMarkdownElement;
    parentNode: TreeNode | null;
    childNodes: TreeNode[];
    type: NodeType;
    orderIndex: string;
    isGeneratingNewline: boolean;
};
declare function createRootTreeNode(target: HTMLMarkdownElement, length?: number): TreeNode;
declare function addNodeToTree(element: HTMLMarkdownElement, parentTreeNode: TreeNode, type: NodeType, length?: number | null): TreeNode;
declare function updateTreeElementRefs(treeRoot: TreeNode, element: HTMLMarkdownElement): TreeNode;
declare function findHTMLElementInTree(treeRoot: TreeNode, element: HTMLElement): TreeNode | null;
declare function getTreeNodeByIndex(treeRoot: TreeNode, index: number): TreeNode | null;
export { addNodeToTree, findHTMLElementInTree, getTreeNodeByIndex, updateTreeElementRefs, createRootTreeNode };
export type { TreeNode, NodeType };
//# sourceMappingURL=treeUtils.d.ts.map