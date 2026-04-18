"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const input_1 = require("@onlook/ui/input");
const tooltip_1 = require("@onlook/ui/tooltip");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const react_arborist_1 = require("react-arborist");
const use_resize_observer_1 = __importDefault(require("use-resize-observer"));
const PageTreeNode_1 = __importDefault(require("../Tree/PageTreeNode"));
const PageTreeRow_1 = __importDefault(require("../Tree/PageTreeRow"));
const PageModal_1 = require("./PageModal");
const PagesTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const { ref, width, height } = (0, use_resize_observer_1.default)();
    const [showCreateModal, setShowCreateModal] = (0, react_1.useState)(false);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [highlightedIndex, setHighlightedIndex] = (0, react_1.useState)(null);
    const treeRef = (0, react_1.useRef)();
    const inputRef = (0, react_1.useRef)(null);
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
        height: Math.max((height ?? 8) - 16, 100),
        width: width ?? 365,
    }), [height, width]);
    const pageTreeProps = (0, react_1.useMemo)(() => ({
        data: filteredPages,
        idAccessor: (node) => node.id,
        childrenAccessor: (node) => node.children && node.children.length > 0 ? node.children : null,
        onSelect: async (nodes) => {
            if (nodes.length > 0) {
                try {
                    await editorEngine.pages.navigateTo(nodes[0].data.path);
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
        renderRow: (props) => (<PageTreeRow_1.default {...props} isHighlighted={highlightedIndex !== null &&
                treeRef.current?.visibleNodes[highlightedIndex]?.id === props.node.id}/>),
        animationDuration: 200,
    }), [
        filteredPages,
        editorEngine.pages.navigateTo,
        dimensions.height,
        dimensions.width,
        highlightedIndex,
    ]);
    return (<div ref={ref} className="flex flex-col gap-2 h-[calc(100vh-8.25rem)] text-xs text-active flex-grow w-full overflow-hidden p-3">
            <div className="flex flex-row justify-between items-center gap-2 m-0">
                <div className="relative flex-grow">
                    <input_1.Input ref={inputRef} className="h-8 text-xs pr-8" placeholder="Search pages" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown}/>
                    {searchQuery && (<button className="absolute right-[1px] top-[1px] bottom-[1px] aspect-square hover:bg-background-onlook active:bg-transparent flex items-center justify-center rounded-r-[calc(theme(borderRadius.md)-1px)] group" onClick={() => setSearchQuery('')}>
                            <index_1.Icons.CrossS className="h-3 w-3 text-foreground-primary/50 group-hover:text-foreground-primary"/>
                        </button>)}
                </div>
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button variant={'default'} size={'icon'} className="p-2 w-fit h-fit text-foreground-primary border-border-primary hover:border-border-onlook bg-background-secondary hover:bg-background-onlook border" onClick={() => setShowCreateModal(true)}>
                            <index_1.Icons.Plus />
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipPortal>
                        <tooltip_1.TooltipContent>
                            <p>Create a new page</p>
                        </tooltip_1.TooltipContent>
                    </tooltip_1.TooltipPortal>
                </tooltip_1.Tooltip>
            </div>

            {filteredPages.length === 0 ? (<div style={{ width: dimensions.width }} className="flex items-center justify-center h-32 text-foreground-primary/50">
                    No pages found
                </div>) : (<react_arborist_1.Tree ref={treeRef} {...pageTreeProps}>
                    {(props) => <PageTreeNode_1.default {...props}/>}
                </react_arborist_1.Tree>)}
            <PageModal_1.PageModal mode="create" open={showCreateModal} onOpenChange={setShowCreateModal}/>
        </div>);
});
exports.default = PagesTab;
//# sourceMappingURL=index.js.map