import { create } from 'zustand';

export interface TreeNode {
    id: string;
    tagName: string;
    className: string;
    isZenithElement: boolean;
    componentName?: string | null;
    children: TreeNode[];
}

interface ExplorerState {
    tree: TreeNode[];
    expandedIds: Set<string>;
    actions: {
        setTree: (tree: TreeNode[]) => void;
        toggleExpanded: (id: string) => void;
        expandToId: (id: string, tree: TreeNode[]) => void;
    };
}

export const useExplorerStore = create<ExplorerState>((set) => ({
    tree: [],
    expandedIds: new Set(),
    actions: {
        setTree: (tree) => set({ tree }),
        toggleExpanded: (id) => set((state) => {
            const next = new Set(state.expandedIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return { expandedIds: next };
        }),
        expandToId: (id, tree) => set((state) => {
            const next = new Set(state.expandedIds);
            const findPath = (nodes: TreeNode[], targetId: string, path: string[] = []): string[] | null => {
                for (const node of nodes) {
                    if (node.id === targetId) return path;
                    const result = findPath(node.children, targetId, [...path, node.id]);
                    if (result) return result;
                }
                return null;
            };
            const path = findPath(tree, id);
            if (path) {
                path.forEach(pid => next.add(pid));
            }
            return { expandedIds: next };
        })
    }
}));
