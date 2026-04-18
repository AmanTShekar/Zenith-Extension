"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const context_menu_1 = require("@onlook/ui/context-menu");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const FileTreeNode = ({ node, style }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const isDirectory = node.data.isDirectory;
    const handleClick = async (e) => {
        if (isDirectory) {
            node.toggle();
            return;
        }
        // Load the file into the editor
        try {
            await editorEngine.code.getFileContent(node.data.path, false).then((content) => {
                if (content !== null) {
                    // This will be handled in the parent component
                    node.select();
                }
            });
        }
        catch (error) {
            console.error('Failed to load file:', error);
        }
    };
    // Get file icon based on extension
    const getFileIcon = () => {
        const extension = node.data.extension?.toLowerCase();
        if (isDirectory) {
            return <icons_1.Icons.Directory className="w-4 h-4 mr-2"/>;
        }
        switch (extension) {
            case '.js':
            case '.jsx':
            case '.ts':
            case '.tsx':
                return <icons_1.Icons.Code className="w-4 h-4 mr-2"/>;
            case '.css':
            case '.scss':
            case '.sass':
                return <icons_1.Icons.Box className="w-4 h-4 mr-2"/>;
            case '.html':
                return <icons_1.Icons.Frame className="w-4 h-4 mr-2"/>;
            case '.json':
                return <icons_1.Icons.Code className="w-4 h-4 mr-2"/>;
            case '.md':
            case '.mdx':
                return <icons_1.Icons.Text className="w-4 h-4 mr-2"/>;
            case '.jpg':
            case '.jpeg':
            case '.png':
            case '.gif':
            case '.svg':
                return <icons_1.Icons.Image className="w-4 h-4 mr-2"/>;
            default:
                return <icons_1.Icons.File className="w-4 h-4 mr-2"/>;
        }
    };
    const menuItems = [
        {
            label: 'Open File',
            action: handleClick,
            icon: <icons_1.Icons.File className="mr-2 h-4 w-4"/>,
            disabled: isDirectory,
        },
        {
            label: 'Copy Path',
            action: () => {
                navigator.clipboard.writeText(node.data.path);
            },
            icon: <icons_1.Icons.Copy className="mr-2 h-4 w-4"/>,
        },
    ];
    return (<context_menu_1.ContextMenu>
            <context_menu_1.ContextMenuTrigger>
                <div style={style} className={(0, utils_1.cn)('flex items-center h-6 cursor-pointer hover:bg-background-hover rounded')} onClick={handleClick}>
                    <span className="w-4 h-4 flex-none relative">
                        {isDirectory && (<div className="w-4 h-4 flex items-center justify-center absolute z-50">
                                <react_1.motion.div initial={false} animate={{ rotate: node.isOpen ? 90 : 0 }}>
                                    <icons_1.Icons.ChevronRight className="h-2.5 w-2.5"/>
                                </react_1.motion.div>
                            </div>)}
                    </span>
                    {getFileIcon()}
                    <span className="truncate">{node.data.name}</span>
                </div>
            </context_menu_1.ContextMenuTrigger>
            <context_menu_1.ContextMenuContent>
                {menuItems.map((item) => (<context_menu_1.ContextMenuItem key={item.label} onClick={item.action} className="cursor-pointer" disabled={item.disabled}>
                        <span className={(0, utils_1.cn)('flex w-full items-center gap-1')}>
                            {item.icon}
                            {item.label}
                        </span>
                    </context_menu_1.ContextMenuItem>))}
            </context_menu_1.ContextMenuContent>
        </context_menu_1.ContextMenu>);
};
exports.default = (0, mobx_react_lite_1.observer)(FileTreeNode);
//# sourceMappingURL=FileTreeNode.js.map