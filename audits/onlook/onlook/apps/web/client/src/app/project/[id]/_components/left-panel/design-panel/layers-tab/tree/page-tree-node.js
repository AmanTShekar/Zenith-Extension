"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageTreeNode = void 0;
const editor_1 = require("@/components/store/editor");
const context_menu_1 = require("@onlook/ui/context-menu");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const page_modal_1 = require("../../page-tab/page-modal");
exports.PageTreeNode = (0, mobx_react_lite_1.observer)(({ node, style }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [showModal, setShowModal] = (0, react_2.useState)(false);
    const [modalMode, setModalMode] = (0, react_2.useState)('create');
    const hasChildren = node.data.children && node.data.children.length > 0;
    const isActive = editorEngine.pages.isNodeActive(node.data);
    const getBaseName = (fullPath) => {
        return fullPath.split('/').pop() ?? '';
    };
    const handleClick = async (e) => {
        if (hasChildren) {
            node.toggle();
        }
        const webviewId = editorEngine.frames.selected[0]?.frame.id;
        if (webviewId) {
            editorEngine.pages.setActivePath(webviewId, node.data.path);
        }
        editorEngine.pages.setCurrentPath(node.data.path);
        node.select();
        await editorEngine.pages.navigateTo(node.data.path);
    };
    const handleRename = () => {
        setModalMode('rename');
        setShowModal(true);
    };
    const handleCreate = () => {
        setModalMode('create');
        setShowModal(true);
    };
    const handleDelete = async () => {
        try {
            await editorEngine.pages.deletePage(node.data.path, node.data.children && node.data.children?.length > 0 ? true : false);
        }
        catch (error) {
            console.error('Failed to delete page:', error);
            sonner_1.toast.error('Failed to delete page', {
                description: error instanceof Error ? error.message : String(error),
            });
        }
    };
    const handleDuplicate = async () => {
        try {
            await editorEngine.pages.duplicatePage(node.data.path, node.data.path);
            (0, sonner_1.toast)('Page duplicated!');
        }
        catch (error) {
            console.error('Failed to duplicate page:', error);
            sonner_1.toast.error('Failed to duplicate page', {
                description: error instanceof Error ? error.message : String(error),
            });
        }
    };
    const menuItems = [
        {
            label: 'Create New Page',
            action: handleCreate,
            icon: <icons_1.Icons.File className="mr-2 h-4 w-4"/>,
        },
        {
            label: 'Duplicate Page',
            action: handleDuplicate,
            icon: <icons_1.Icons.Copy className="mr-2 h-4 w-4"/>,
            disabled: node.data.isRoot,
        },
        {
            label: 'Rename',
            action: handleRename,
            icon: <icons_1.Icons.Pencil className="mr-2 h-4 w-4"/>,
            disabled: node.data.isRoot,
        },
        {
            label: 'Delete',
            action: handleDelete,
            icon: <icons_1.Icons.Trash className="mr-2 h-4 w-4"/>,
            destructive: true,
            disabled: node.data.isRoot,
        },
    ];
    return (<>
            <context_menu_1.ContextMenu>
                <context_menu_1.ContextMenuTrigger>
                    <div style={style} className={(0, utils_1.cn)('flex items-center h-6 cursor-pointer rounded hover:bg-background-hover', isActive && 'hover:bg-red-500/90 bg-red-500 text-white')} onClick={handleClick}>
                        <span className="w-4 h-4 flex-none relative">
                            {hasChildren && (<div className="w-4 h-4 flex items-center justify-center absolute z-50">
                                    <react_1.motion.div initial={false} animate={{ rotate: node.isOpen ? 90 : 0 }}>
                                        <icons_1.Icons.ChevronRight className="h-2.5 w-2.5"/>
                                    </react_1.motion.div>
                                </div>)}
                        </span>
                        {!node.data.isRoot &&
            (hasChildren ? (<icons_1.Icons.Directory className="w-4 h-4 mr-2"/>) : (<icons_1.Icons.File className="w-4 h-4 mr-2"/>))}
                        <span>{node.data.name}</span>
                    </div>
                </context_menu_1.ContextMenuTrigger>
                <context_menu_1.ContextMenuContent>
                    {menuItems.map((item) => (<context_menu_1.ContextMenuItem key={item.label} onClick={item.action} className="cursor-pointer" disabled={item.disabled}>
                            <span className={(0, utils_1.cn)('flex w-full items-center gap-1', item.destructive && 'text-red')}>
                                {item.icon}

                                {item.label}
                            </span>
                        </context_menu_1.ContextMenuItem>))}
                </context_menu_1.ContextMenuContent>
            </context_menu_1.ContextMenu>

            <page_modal_1.PageModal open={showModal} onOpenChange={setShowModal} mode={modalMode} baseRoute={node.data.path} initialName={modalMode === 'rename' ? getBaseName(node.data.path) : ''}/>
        </>);
});
//# sourceMappingURL=page-tree-node.js.map