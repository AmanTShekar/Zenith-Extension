"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTree = void 0;
const utility_1 = require("@onlook/utility");
const react_1 = __importStar(require("react"));
const react_arborist_1 = require("react-arborist");
const use_resize_observer_1 = __importDefault(require("use-resize-observer"));
const file_tree_node_1 = require("./file-tree-node");
const file_tree_row_1 = require("./file-tree-row");
const file_tree_search_1 = require("./file-tree-search");
const FileTree = ({ onFileSelect, onDeleteFile, onRenameFile, onRefresh, fileEntries, isLoading, selectedFilePath, onAddToChat }) => {
    const treeRef = (0, react_1.useRef)(null);
    const inputRef = (0, react_1.useRef)(null);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [highlightedIndex, setHighlightedIndex] = (0, react_1.useState)(null);
    const { ref: resizeObserverRef, width: filesWidth, height: filesHeight } = (0, use_resize_observer_1.default)();
    // Create flat entry index for efficient operations
    const flatEntryIndex = (0, react_1.useMemo)(() => {
        const flatIndex = new Map();
        const flattenEntries = (entries) => {
            for (const entry of entries) {
                flatIndex.set(entry.path, entry);
                if (entry.children) {
                    flattenEntries(entry.children);
                }
            }
        };
        flattenEntries(fileEntries);
        return flatIndex;
    }, [fileEntries]);
    // Sync tree selection with selected file
    (0, react_1.useEffect)(() => {
        if (!treeRef.current || !fileEntries.length) {
            return;
        }
        if (!selectedFilePath) {
            // Clear selection when no file is selected
            treeRef.current.deselectAll();
            return;
        }
        // Find the entry that matches the file using robust path comparison
        let targetEntry = null;
        for (const [path, entry] of flatEntryIndex) {
            if (!entry.isDirectory && (0, utility_1.pathsEqual)(path, selectedFilePath)) {
                targetEntry = entry;
                break;
            }
        }
        if (targetEntry) {
            treeRef.current.select(targetEntry.path);
            treeRef.current.scrollTo(targetEntry.path);
        }
    }, [selectedFilePath, fileEntries, flatEntryIndex]);
    const filteredFiles = (0, react_1.useMemo)(() => {
        if (!searchQuery.trim()) {
            return fileEntries;
        }
        const searchLower = searchQuery.toLowerCase();
        const matchingPaths = new Set();
        // Find all matching entries using flat index
        for (const [path, entry] of flatEntryIndex) {
            const nameMatches = entry.name.toLowerCase().includes(searchLower);
            const pathMatches = path.toLowerCase().includes(searchLower);
            if (nameMatches || pathMatches) {
                matchingPaths.add(path);
                // Add all parent paths to ensure they're included
                const pathSegments = path.split('/').filter(Boolean);
                for (let i = 1; i < pathSegments.length; i++) {
                    const parentPath = '/' + pathSegments.slice(0, i).join('/');
                    matchingPaths.add(parentPath);
                }
            }
        }
        // Build filtered tree structure
        const filterEntries = (entries) => {
            return entries.reduce((filtered, entry) => {
                if (matchingPaths.has(entry.path)) {
                    const newEntry = { ...entry };
                    if (entry.children) {
                        newEntry.children = filterEntries(entry.children);
                    }
                    filtered.push(newEntry);
                }
                return filtered;
            }, []);
        };
        return filterEntries(fileEntries);
    }, [fileEntries, flatEntryIndex, searchQuery]);
    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setSearchQuery('');
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
            if (selectedNode && !selectedNode.isInternal && !selectedNode.data.isDirectory) {
                const hasSearchTerm = searchQuery.trim().length > 0;
                onFileSelect(selectedNode.data.path, hasSearchTerm ? searchQuery : undefined);
                setHighlightedIndex(null);
            }
        }
    };
    const handleFileTreeSelect = (nodes) => {
        if (nodes.length > 0 && !nodes[0]?.data.isDirectory && nodes[0]?.data.path) {
            const hasSearchTerm = searchQuery.trim().length > 0;
            onFileSelect(nodes[0].data.path, hasSearchTerm ? searchQuery : undefined);
        }
    };
    const filesTreeDimensions = (0, react_1.useMemo)(() => ({
        width: filesWidth ?? 224, // Match w-56 container width (224px)
        height: (filesHeight ?? 300) - 50,
    }), [filesWidth, filesHeight]);
    return (<div className="w-56 border-r-[0.5px] flex flex-col h-full">
            <file_tree_search_1.FileTreeSearch ref={inputRef} searchQuery={searchQuery} isLoading={isLoading} onSearchChange={setSearchQuery} onRefresh={onRefresh} onKeyDown={handleKeyDown}/>
            <div ref={resizeObserverRef} className="w-full text-xs px-2 flex-1 min-h-0">
                {isLoading ? (<div className="flex flex-col justify-start items-center h-full text-sm text-foreground/50 pt-4">
                        <div className="animate-spin h-6 w-6 border-2 border-foreground-hover rounded-full border-t-transparent mb-2"></div>
                        <span>Loading files...</span>
                    </div>) : filteredFiles.length === 0 ? (<div className="flex flex-col justify-start items-center h-full text-sm text-foreground/50 pt-4">
                        {fileEntries.length === 0 ? 'No files found' : 'No files match your search'}
                    </div>) : (<react_arborist_1.Tree ref={treeRef} data={filteredFiles} className="h-full overflow-hidden" idAccessor={(entry) => entry.path} childrenAccessor={(entry) => entry.children && entry.children.length > 0
                ? entry.children
                : null} onSelect={handleFileTreeSelect} height={filesTreeDimensions.height} width={filesTreeDimensions.width} indent={8} rowHeight={24} openByDefault={false} renderRow={(props) => (<file_tree_row_1.FileTreeRow {...props} isHighlighted={highlightedIndex !== null &&
                    treeRef.current?.visibleNodes[highlightedIndex]?.id ===
                        props.node.id}/>)}>
                        {(props) => <file_tree_node_1.FileTreeNode {...props} onFileSelect={onFileSelect} onRenameFile={onRenameFile} onDeleteFile={onDeleteFile} onAddToChat={onAddToChat}/>}
                    </react_arborist_1.Tree>)}
            </div>
        </div>);
};
exports.FileTree = FileTree;
//# sourceMappingURL=file-tree.js.map