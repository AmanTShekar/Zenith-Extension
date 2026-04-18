"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTreeNode = void 0;
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const context_menu_1 = require("@onlook/ui/context-menu");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const react_1 = require("motion/react");
const react_2 = require("react");
const file_icon_1 = require("./file-icon");
const FileTreeNode = ({ node, style, onFileSelect, onRenameFile, onDeleteFile, onAddToChat }) => {
    const [isEditing, setIsEditing] = (0, react_2.useState)(false);
    const [editingName, setEditingName] = (0, react_2.useState)(node.data.name);
    const [showDeleteDialog, setShowDeleteDialog] = (0, react_2.useState)(false);
    const inputRef = (0, react_2.useRef)(null);
    const isDirectory = node.data.isDirectory;
    const handleClick = (e) => {
        if (isEditing)
            return;
        if (isDirectory) {
            node.toggle();
            return;
        }
        if (onFileSelect) {
            onFileSelect(node.data.path);
        }
        // Select the node in the tree
        node.select();
    };
    const handleRename = () => {
        if (node.data.isDirectory)
            return;
        if (isEditing)
            return;
        setIsEditing(true);
        setEditingName(node.data.name);
    };
    (0, react_2.useEffect)(() => {
        const input = inputRef.current;
        if (!input) {
            return;
        }
        if (!isEditing) {
            return;
        }
        // Don't focus if already focused
        if (document.activeElement === input) {
            return;
        }
        input.focus();
        const filename = node.data.name;
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && !isDirectory) {
            // Select from start to before the last dot (extension)
            input?.setSelectionRange(0, lastDotIndex);
        }
        else {
            // If no extension or is directory, select all
            input?.select();
        }
    }, [inputRef.current]);
    const handleBlur = () => {
        if (editingName.trim() && editingName !== node.data.name) {
            const newPath = node.data.path.replace(node.data.name, editingName.trim());
            onRenameFile(node.data.path, newPath);
        }
        setIsEditing(false);
        setEditingName(node.data.name);
    };
    const handleKeyDown = (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            handleBlur();
        }
        else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditingName(node.data.name);
        }
    };
    const handleAddToChat = () => {
        if (isDirectory || !onAddToChat)
            return;
        onAddToChat(node.data.path);
    };
    const handleCopyPath = async () => {
        try {
            await navigator.clipboard.writeText(node.data.path);
        }
        catch (error) {
            console.error('Failed to copy path:', error);
        }
    };
    const menuItems = [
        !isDirectory ? {
            label: 'Add to Chat',
            action: handleAddToChat,
            icon: <icons_1.Icons.Plus className="w-4 h-4"/>,
            separator: false,
        } : null,
        {
            label: 'Copy Path',
            action: handleCopyPath,
            icon: <icons_1.Icons.Copy className="w-4 h-4"/>,
            separator: false,
        },
        !isDirectory ? {
            label: 'Rename',
            action: handleRename,
            icon: <icons_1.Icons.Edit className="w-4 h-4"/>,
            separator: false,
        } : null,
        {
            label: 'Delete',
            action: () => {
                setShowDeleteDialog(true);
            },
            icon: <icons_1.Icons.Trash className="w-4 h-4 text-red-500"/>,
            separator: false,
            className: 'text-red-500',
        }
    ];
    return (<context_menu_1.ContextMenu>
            <context_menu_1.ContextMenuTrigger>
                <div style={style} className="flex items-center h-6 cursor-pointer rounded" onClick={handleClick} onDoubleClick={(e) => handleRename()}>
                    <span className="w-4 h-4 flex-none relative">
                        {isDirectory && (<div className="w-4 h-4 flex items-center justify-center absolute z-50">
                                <react_1.motion.div initial={false} animate={{ rotate: node.isOpen ? 90 : 0 }}>
                                    <icons_1.Icons.ChevronRight className="h-2.5 w-2.5"/>
                                </react_1.motion.div>
                            </div>)}
                    </span>
                    <file_icon_1.FileIcon path={node.data.path} isDirectory={isDirectory}/>
                    {isEditing ? (<input ref={inputRef} type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} className="truncate bg-transparent rounded-[1px] outline-2 outline-rounded outline-border-primary outline-offset-2 px-0" onClick={(e) => e.stopPropagation()}/>) : (<span className="truncate">{node.data.name}</span>)}
                    {/* {!isDirectory && contentMatches?.has(node.data.path) && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium min-w-[20px] text-center">
                {contentMatches.get(node.data.path)}
            </span>
        )} */}
                </div>
            </context_menu_1.ContextMenuTrigger>
            <context_menu_1.ContextMenuContent>
                {menuItems.filter(item => item !== null).map((item, index) => (<div key={item.label}>
                        <context_menu_1.ContextMenuItem onClick={item.action} className="cursor-pointer">
                            <span className={(0, utils_1.cn)('flex w-full items-center gap-1', item.className)}>
                                {item.icon}
                                {item.label}
                            </span>
                        </context_menu_1.ContextMenuItem>
                        {item.separator && <context_menu_1.ContextMenuSeparator />}
                    </div>))}
            </context_menu_1.ContextMenuContent>

            <alert_dialog_1.AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <alert_dialog_1.AlertDialogContent>
                    <alert_dialog_1.AlertDialogHeader>
                        <alert_dialog_1.AlertDialogTitle>Delete {isDirectory ? 'Folder' : 'File'}</alert_dialog_1.AlertDialogTitle>
                        <alert_dialog_1.AlertDialogDescription>
                            Are you sure you want to delete "{node.data.name}"?
                            {isDirectory
            ? ' This will permanently delete the folder and all its contents.'
            : ' This action cannot be undone.'}
                        </alert_dialog_1.AlertDialogDescription>
                    </alert_dialog_1.AlertDialogHeader>
                    <alert_dialog_1.AlertDialogFooter>
                        <alert_dialog_1.AlertDialogCancel>Cancel</alert_dialog_1.AlertDialogCancel>
                        <alert_dialog_1.AlertDialogAction onClick={() => {
            onDeleteFile(node.data.path);
            setShowDeleteDialog(false);
        }} className="bg-red-600 hover:bg-red-700 text-primary">
                            Delete
                        </alert_dialog_1.AlertDialogAction>
                    </alert_dialog_1.AlertDialogFooter>
                </alert_dialog_1.AlertDialogContent>
            </alert_dialog_1.AlertDialog>
        </context_menu_1.ContextMenu>);
};
exports.FileTreeNode = FileTreeNode;
//# sourceMappingURL=file-tree-node.js.map