export interface TagHierarchyNode {
    name: string;
    value: number;
    children: TagHierarchyNode[];
    node_type: 'root' | 'tag';
    tag_id: string | null;
    symbol: string | null;
    weight: number | null;
}

export interface TagHierarchyRoot extends TagHierarchyNode {
    node_type: 'root';
    tag_id: null;
    symbol: null;
    weight: null;
}

export interface TagHierarchyTag extends TagHierarchyNode {
    node_type: 'tag';
    tag_id: string;
    symbol: string | null;
    weight: number | null;
}

// Type guard to check if a node is a root node
export function isRootNode(node: TagHierarchyNode): node is TagHierarchyRoot {
    return node.node_type === 'root';
}

// Type guard to check if a node is a tag node
export function isTagNode(node: TagHierarchyNode): node is TagHierarchyTag {
    return node.node_type === 'tag';
}
