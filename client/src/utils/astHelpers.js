/**
 * Finds a node by ID in a nested AST tree.
 * @param {Array} nodes - The root array of nodes.
 * @param {string} id - The node ID to find.
 * @returns {Object|null} The node if found, else null.
 */
export const findNodeDeep = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeDeep(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Returns a new array of nodes with the new node inserted.
 * If parentId is null/undefined, adds to the root level.
 */
export const addNodeDeep = (nodes, parentId, newNode) => {
  if (!parentId) {
    return [...nodes, newNode];
  }

  return nodes.map(node => {
    if (node.id === parentId) {
      // Add child, respecting constraints if we want to enforce them deeply
      return { ...node, children: [...(node.children || []), newNode] };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: addNodeDeep(node.children, parentId, newNode) };
    }
    return node;
  });
};

/**
 * Returns a new array of nodes with the specified node removed.
 */
export const removeNodeDeep = (nodes, id) => {
  return nodes.filter(node => node.id !== id).map(node => {
    if (node.children && node.children.length > 0) {
      return { ...node, children: removeNodeDeep(node.children, id) };
    }
    return node;
  });
};

/**
 * Returns a new array of nodes with the specified node updated.
 * Handles deep merging of nested objects like styleJson.
 */
export const updateNodeDeep = (nodes, id, updates) => {
  return nodes.map(node => {
    if (node.id === id) {
      // Handle deep merge for specific objects like styleJson
      const mergedStyleJson = updates.styleJson 
        ? { ...node.styleJson, ...updates.styleJson }
        : node.styleJson;
        
      return { 
        ...node, 
        ...updates,
        styleJson: mergedStyleJson
      };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: updateNodeDeep(node.children, id, updates) };
    }
    return node;
  });
};

/**
 * Checks if a child can be added to a parent based on constraints.
 */
export const canNest = (parentType, childType, cvComponentsLibrary) => {
  if (!parentType) return true; // Root allows mostly anything, or check root rules
  const parentConfig = cvComponentsLibrary.find(c => c.type === parentType)?.defaultConfig;
  const childConfig = cvComponentsLibrary.find(c => c.type === childType)?.defaultConfig;

  if (!parentConfig || !childConfig) return false;
  
  if (!parentConfig.constraints.canNest) return false;
  if (parentConfig.constraints.allowedChildren && !parentConfig.constraints.allowedChildren.includes(childType) && !parentConfig.constraints.allowedChildren.includes('*')) {
    return false;
  }
  if (childConfig.constraints.allowedParents && !childConfig.constraints.allowedParents.includes(parentType) && !childConfig.constraints.allowedParents.includes('*')) {
    return false;
  }

  return true;
};
