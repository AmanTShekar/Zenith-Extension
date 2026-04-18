"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesTab = void 0;
const editor_1 = require("@/components/store/editor");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const tooltip_1 = require("@onlook/ui/tooltip");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const react_arborist_1 = require("react-arborist");
const use_resize_observer_1 = __importDefault(require("use-resize-observer"));
const page_tree_node_1 = require("../layers-tab/tree/page-tree-node");
const page_tree_row_1 = require("../layers-tab/tree/page-tree-row");
const page_modal_1 = require("./page-modal");
exports.PagesTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { ref, width, height } = (0, use_resize_observer_1.default)();
    const [showCreateModal, setShowCreateModal] = (0, react_1.useState)(false);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [highlightedIndex, setHighlightedIndex] = (0, react_1.useState)(null);
    const treeRef = (0, react_1.useRef)(null);
    const inputRef = (0, react_1.useRef)(null);
    // TODO: use file system like code tab
    (0, react_1.useEffect)(() => {
        editorEngine.pages.scanPages();
    }, []);
    const filteredPages = (0, react_1.useMemo)(() => {
        if (!searchQuery.trim()) {
            return editorEngine.pages.tree;
        }
        const searchLower = searchQuery.toLowerCase();
        const getDisplayName = (node) => {
            return node.name;
        };
        const filterNodes = (nodes) => {
            return nodes.reduce((filtered, node) => {
                const displayName = getDisplayName(node);
                const matches = displayName.toLowerCase().includes(searchLower);
                const childMatches = node.children ? filterNodes(node.children) : [];
                if (matches || childMatches.length > 0) {
                    const newNode = { ...node };
                    if (childMatches.length > 0) {
                        newNode.children = childMatches;
                    }
                    filtered.push(newNode);
                }
                return filtered;
            }, []);
        };
        return filterNodes(editorEngine.pages.tree);
    }, [editorEngine.pages.tree, searchQuery]);
    const handleKeyDown = async (e) => {
        if (e.key === 'Escape') {
            setSearchQuery('');
            inputRef.current?.blur();
            setHighlightedIndex(null);
            return;
        }
        const flattenedNodes = treeRef.current?.visibleNodes ?? [];
        if (flattenedNodes.length === 0) {
            return;
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (highlightedIndex === null) {
                setHighlightedIndex(e.key === 'ArrowDown' ? 0 : flattenedNodes.length - 1);
                return;
            }
            const newIndex = e.key === 'ArrowDown'
                ? Math.min(highlightedIndex + 1, flattenedNodes.length - 1)
                : Math.max(highlightedIndex - 1, 0);
            setHighlightedIndex(newIndex);
            // Ensure highlighted item is visible
            const node = flattenedNodes[newIndex];
            if (node) {
                treeRef.current?.scrollTo(node.id);
            }
        }
        if (e.key === 'Enter' && highlightedIndex !== null) {
            const selectedNode = flattenedNodes[highlightedIndex];
            if (selectedNode && !selectedNode.isInternal) {
                try {
                    await editorEngine.pages.navigateTo(selectedNode.data.path);
                    setHighlightedIndex(null);
                }
                catch (error) {
                    console.error('Failed to navigate to page:', error);
                }
            }
        }
    };
    const dimensions = (0, react_1.useMemo)(() => ({
        height: Math.max((height ?? 8) - 32, 100),
        width: width ?? 365,
    }), [height, width]);
    const pageTreeProps = (0, react_1.useMemo)(() => ({
        data: filteredPages,
        idAccessor: (node) => node.id,
        childrenAccessor: (node) => node.children && node.children.length > 0 ? node.children : null,
        onSelect: async (nodes) => {
            if (nodes.length > 0) {
                try {
                    await editorEngine.pages.navigateTo(nodes[0]?.data?.path ?? '');
                    setHighlightedIndex(null);
                }
                catch (error) {
                    console.error('Failed to navigate to page:', error);
                }
            }
        },
        height: dimensions.height,
        width: dimensions.width,
        indent: 8,
        rowHeight: 24,
        openByDefault: true,
        renderRow: (props) => (<page_tree_row_1.PageTreeRow {...props} isHighlighted={highlightedIndex !== null &&
                treeRef.current?.visibleNodes[highlightedIndex]?.id === props.node.id}/>),
        animationDuration: 200,
    }), [filteredPages, dimensions.height, dimensions.width, highlightedIndex, editorEngine.pages]);
    return (<div ref={ref} className="text-active flex h-full w-full flex-grow flex-col gap-2 overflow-hidden p-3 text-xs">
            <div className="m-0 flex flex-row items-center justify-between gap-2">
                <div className="relative flex-grow">
                    <input_1.Input ref={inputRef} className="h-8 pr-8 text-xs" placeholder="Search pages" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown}/>
                    {searchQuery && (<button className="hover:bg-background-onlook group absolute top-[1px] right-[1px] bottom-[1px] flex aspect-square items-center justify-center rounded-r-[calc(theme(borderRadius.md)-1px)] active:bg-transparent" onClick={() => setSearchQuery('')}>
                            <icons_1.Icons.CrossS className="text-foreground-primary/50 group-hover:text-foreground-primary h-3 w-3"/>
                        </button>)}
                </div>
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button variant={'default'} size={'icon'} className="text-foreground-primary border-border-primary hover:border-border-onlook bg-background-secondary hover:bg-background-onlook h-fit w-fit border p-2" onClick={() => setShowCreateModal(true)}>
                            <icons_1.Icons.Plus />
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipPortal>
                        <tooltip_1.TooltipContent>
                            <p>Create a new page</p>
                        </tooltip_1.TooltipContent>
                    </tooltip_1.TooltipPortal>
                </tooltip_1.Tooltip>
            </div>

            {filteredPages.length === 0 ? (<div style={{ width: dimensions.width }} className="text-foreground-primary/50 flex h-32 items-center justify-center">
                    No pages found
                </div>) : (<react_arborist_1.Tree ref={treeRef} {...pageTreeProps}>
                    {(props) => <page_tree_node_1.PageTreeNode {...props}/>}
                </react_arborist_1.Tree>)}
            <page_modal_1.PageModal mode="create" open={showCreateModal} onOpenChange={setShowCreateModal}/>
        </div>);
});
//# sourceMappingURL=index.js.map