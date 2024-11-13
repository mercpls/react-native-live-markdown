function createRootTreeNode(target, length = 0) {
  return {
    element: target,
    start: 0,
    length,
    parentNode: null,
    childNodes: [],
    type: 'root',
    orderIndex: '',
    isGeneratingNewline: false
  };
}
function addNodeToTree(element, parentTreeNode, type, length = null) {
  var _element$value, _element$childNodes$, _element$childNodes$$;
  const contentLength = length || (element.nodeName === 'BR' || type === 'br' ? 1 : (_element$value = element.value) === null || _element$value === void 0 ? void 0 : _element$value.length) || 0;
  const isGeneratingNewline = type === 'line' && !(element.childNodes.length === 1 && ((_element$childNodes$ = element.childNodes[0]) === null || _element$childNodes$ === void 0 || (_element$childNodes$$ = _element$childNodes$.getAttribute) === null || _element$childNodes$$ === void 0 ? void 0 : _element$childNodes$$.call(_element$childNodes$, 'data-type')) === 'br');
  const parentChildrenCount = (parentTreeNode === null || parentTreeNode === void 0 ? void 0 : parentTreeNode.childNodes.length) || 0;
  let startIndex = parentTreeNode.start;
  if (parentChildrenCount > 0) {
    const lastParentChild = parentTreeNode.childNodes[parentChildrenCount - 1];
    if (lastParentChild) {
      startIndex = lastParentChild.start + lastParentChild.length;
      startIndex += lastParentChild.isGeneratingNewline || type !== 'block' && element.style.display === 'block' ? 1 : 0;
    }
  }
  const item = {
    element,
    parentNode: parentTreeNode,
    childNodes: [],
    start: startIndex,
    length: contentLength,
    type,
    orderIndex: parentTreeNode.parentNode === null ? `${parentChildrenCount}` : `${parentTreeNode.orderIndex},${parentChildrenCount}`,
    isGeneratingNewline
  };
  element.setAttribute('data-id', item.orderIndex);
  parentTreeNode.childNodes.push(item);
  return item;
}
function updateTreeElementRefs(treeRoot, element) {
  const stack = [treeRoot];
  const treeElements = element.querySelectorAll('[data-id]');
  const dataIDToElementMap = {};
  treeElements.forEach(el => {
    const dataID = el.getAttribute('data-id');
    if (!dataID) {
      return;
    }
    dataIDToElementMap[dataID] = el;
  });
  while (stack.length > 0) {
    const node = stack.pop();
    stack.push(...node.childNodes);
    const currentElement = dataIDToElementMap[node.orderIndex];
    if (currentElement) {
      node.element = currentElement;
    }
  }
  return treeRoot;
}
function findHTMLElementInTree(treeRoot, element) {
  var _element$hasAttribute, _element$hasAttribute2, _element$getAttribute;
  if ((_element$hasAttribute = element.hasAttribute) !== null && _element$hasAttribute !== void 0 && _element$hasAttribute.call(element, 'contenteditable')) {
    return treeRoot;
  }
  if (!element || !((_element$hasAttribute2 = element.hasAttribute) !== null && _element$hasAttribute2 !== void 0 && _element$hasAttribute2.call(element, 'data-id'))) {
    return null;
  }
  const indexes = (_element$getAttribute = element.getAttribute('data-id')) === null || _element$getAttribute === void 0 ? void 0 : _element$getAttribute.split(',');
  let el = treeRoot;
  while (el && indexes && indexes.length > 0) {
    const index = Number(indexes.shift() || -1);
    if (index < 0) {
      break;
    }
    if (el) {
      el = el.childNodes[index] || null;
    }
  }
  return el;
}
function getTreeNodeByIndex(treeRoot, index) {
  let el = treeRoot;
  let i = 0;
  let newLineGenerated = false;
  if (treeRoot.length === 0) {
    return treeRoot;
  }
  while (el && el.childNodes.length > 0 && i < el.childNodes.length) {
    const child = el.childNodes[i];
    if (!child) {
      break;
    }
    if (index >= child.start && index < child.start + child.length) {
      if (child.childNodes.length === 0) {
        return child;
      }
      el = child;
      i = 0;
    } else if ((child.isGeneratingNewline || newLineGenerated || i === el.childNodes.length - 1) && index === child.start + child.length) {
      newLineGenerated = true;
      if (child.childNodes.length === 0) {
        return child;
      }
      el = child;
      i = 0;
    } else {
      i++;
    }
  }
  return null;
}
export { addNodeToTree, findHTMLElementInTree, getTreeNodeByIndex, updateTreeElementRefs, createRootTreeNode };
//# sourceMappingURL=treeUtils.js.map