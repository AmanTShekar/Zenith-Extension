"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const context_menu_1 = require("@onlook/ui/context-menu");
const icons_1 = require("@onlook/ui/icons");
const use_toast_1 = require("@onlook/ui/use-toast");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const PageModal_1 = require("../PageTab/PageModal");
const PageTreeNode = ({ node, style }) => {
    const hasChildren = node.data.children && node.data.children.length > 0;
    const editorEngine = (0, Context_1.useEditorEngine)();
    const isActive = !hasChildren && editorEngine.pages.isNodeActive(node.data);
    const [showModal, setShowModal] = (0, react_2.useState)(false);
    const [modalMode, setModalMode] = (0, react_2.useState)('create');
    const getBaseName = (fullPath) => {
        return fullPath.split('/').pop() || '';
    };
    const handleClick = async (e) => {
        if (hasChildren) {
            node.toggle();
            return;
        }
        const webviewId = editorEngine.webviews.selected[0]?.id;
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
            (0, use_toast_1.toast)({
                title: 'Failed to delete page',
                description: error instanceof Error ? error.message : String(error),
                variant: 'destructive',
            });
        }
    };
    const handleDuplicate = async () => {
        try {
            await editorEngine.pages.duplicatePage(node.data.path, node.data.path);
            (0, use_toast_1.toast)({
                title: 'Page duplicated',
                description: 'Page has been successfully duplicated.',
                variant: 'default',
            });
        }
        catch (error) {
            console.error('Failed to duplicate page:', error);
            (0, use_toast_1.toast)({
                title: 'Failed to duplicate page',
                description: error instanceof Error ? error.message : String(error),
                variant: 'destructive',
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
            action: () => {
                handleDuplicate();
            },
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
                    <div style={style} className={(0, utils_1.cn)('flex items-center h-6 cursor-pointer hover:bg-background-hover rounded', !hasChildren && isActive && 'bg-red-500 text-white', isActive && 'hover:bg-red-500')} onClick={handleClick}>
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

            <PageModal_1.PageModal open={showModal} onOpenChange={setShowModal} mode={modalMode} baseRoute={node.data.path} initialName={modalMode === 'rename' ? getBaseName(node.data.path) : ''}/>
        </>);
};
exports.default = (0, mobx_react_lite_1.observer)(PageTreeNode);
//# sourceMappingURL=PageTreeNode.js.map