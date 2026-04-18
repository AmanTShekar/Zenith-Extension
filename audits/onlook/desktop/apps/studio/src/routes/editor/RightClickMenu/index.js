"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RightClickMenu = void 0;
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const ide_1 = require("@onlook/models/ide");
const context_menu_1 = require("@onlook/ui/context-menu");
const icons_1 = require("@onlook/ui/icons");
const kbd_1 = require("@onlook/ui/kbd");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const hotkeys_1 = require("/common/hotkeys");
const ide_2 = require("/common/ide");
exports.RightClickMenu = (0, mobx_react_lite_1.observer)(({ children }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const userManager = (0, Context_1.useUserManager)();
    const [menuItems, setMenuItems] = (0, react_1.useState)([]);
    const ide = ide_2.IDE.fromType(userManager.settings.settings?.editor?.ideType || ide_1.DEFAULT_IDE);
    (0, react_1.useEffect)(() => {
        updateMenuItems();
    }, [
        editorEngine.elements.selected,
        editorEngine.ast.mappings.layers,
        editorEngine.webviews.selected,
    ]);
    const OPEN_DEV_TOOL_ITEM = {
        label: 'Open devtool',
        action: () => editorEngine.inspect(),
        icon: <icons_1.Icons.Code className="mr-2 h-4 w-4"/>,
        hotkey: hotkeys_1.Hotkey.OPEN_DEV_TOOL,
    };
    const TOOL_ITEMS = [
        OPEN_DEV_TOOL_ITEM,
        {
            label: 'Add to AI Chat',
            action: () => {
                editorEngine.editPanelTab = models_1.EditorTabValue.CHAT;
                editorEngine.chat.focusChatInput();
            },
            icon: <icons_1.Icons.MagicWand className="mr-2 h-4 w-4"/>,
            hotkey: hotkeys_1.Hotkey.ADD_AI_CHAT,
            disabled: !editorEngine.elements.selected.length,
        },
        {
            label: 'New AI Chat',
            action: () => {
                editorEngine.editPanelTab = models_1.EditorTabValue.CHAT;
                editorEngine.chat.conversation.startNewConversation();
                editorEngine.chat.focusChatInput();
            },
            icon: <icons_1.Icons.MagicWand className="mr-2 h-4 w-4"/>,
            hotkey: hotkeys_1.Hotkey.NEW_AI_CHAT,
        },
    ];
    const GROUP_ITEMS = [
        {
            label: 'Group',
            action: () => editorEngine.group.groupSelectedElements(),
            icon: <icons_1.Icons.Box className="mr-2 h-4 w-4"/>,
            disabled: !editorEngine.group.canGroupElements(),
            hotkey: hotkeys_1.Hotkey.GROUP,
        },
        {
            label: 'Ungroup',
            action: () => editorEngine.group.ungroupSelectedElement(),
            icon: <icons_1.Icons.Group className="mr-2 h-4 w-4"/>,
            disabled: !editorEngine.group.canUngroupElement(),
            hotkey: hotkeys_1.Hotkey.UNGROUP,
        },
    ];
    const EDITING_ITEMS = [
        {
            label: 'Edit text',
            action: () => editorEngine.text.editSelectedElement(),
            icon: <icons_1.Icons.Pencil className="mr-2 h-4 w-4"/>,
            hotkey: hotkeys_1.Hotkey.ENTER,
        },
        {
            label: 'Copy',
            action: () => editorEngine.copy.copy(),
            icon: <icons_1.Icons.Clipboard className="mr-2 h-4 w-4"/>,
            hotkey: hotkeys_1.Hotkey.COPY,
        },
        {
            label: 'Paste',
            action: () => editorEngine.copy.paste(),
            icon: <icons_1.Icons.ClipboardCopy className="mr-2 h-4 w-4"/>,
            hotkey: hotkeys_1.Hotkey.PASTE,
        },
        {
            label: 'Cut',
            action: () => editorEngine.copy.cut(),
            icon: <icons_1.Icons.Scissors className="mr-2 h-4 w-4"/>,
            hotkey: hotkeys_1.Hotkey.CUT,
        },
        {
            label: 'Duplicate',
            action: () => editorEngine.copy.duplicate(),
            icon: <icons_1.Icons.Copy className="mr-2 h-4 w-4"/>,
            hotkey: hotkeys_1.Hotkey.DUPLICATE,
        },
        {
            label: 'Delete',
            action: () => editorEngine.elements.delete(),
            icon: <icons_1.Icons.Trash className="mr-2 h-4 w-4"/>,
            hotkey: hotkeys_1.Hotkey.DELETE,
            destructive: true,
        },
    ];
    const WINDOW_ITEMS = [
        {
            label: 'Duplicate',
            action: () => editorEngine.duplicateWindow(),
            icon: <icons_1.Icons.Copy className="mr-2 h-4 w-4"/>,
            hotkey: hotkeys_1.Hotkey.DUPLICATE,
        },
        {
            label: 'Delete',
            action: () => editorEngine.deleteWindow(editorEngine.webviews.selected[0].id),
            icon: <icons_1.Icons.Trash className="mr-2 h-4 w-4"/>,
            hotkey: hotkeys_1.Hotkey.DELETE,
            destructive: true,
            disabled: !editorEngine.canDeleteWindow(),
        },
    ];
    const updateMenuItems = () => {
        let instance = null;
        let root = null;
        if (editorEngine.elements.selected.length > 0) {
            const element = editorEngine.elements.selected[0];
            instance = element.instanceId;
            root = element.oid;
        }
        let menuItems = [];
        if (editorEngine.isWindowSelected) {
            menuItems = [WINDOW_ITEMS, [OPEN_DEV_TOOL_ITEM]];
        }
        else {
            const updatedToolItems = [
                instance !== null && {
                    label: 'View instance code',
                    action: () => viewSource(instance),
                    icon: <icons_1.Icons.ComponentInstance className="mr-2 h-4 w-4"/>,
                },
                {
                    label: `View ${instance ? 'component' : 'element'} in ${ide.displayName}`,
                    disabled: !root,
                    action: () => viewSource(root),
                    icon: instance ? (<icons_1.Icons.Component className="mr-2 h-4 w-4"/>) : (<icons_1.Icons.ExternalLink className="mr-2 h-4 w-4"/>),
                },
                ...TOOL_ITEMS,
            ].filter(Boolean);
            menuItems = [updatedToolItems, GROUP_ITEMS, EDITING_ITEMS];
        }
        setMenuItems(menuItems);
    };
    function viewSource(oid) {
        editorEngine.code.viewSource(oid);
    }
    return (<context_menu_1.ContextMenu>
            <context_menu_1.ContextMenuTrigger>{children}</context_menu_1.ContextMenuTrigger>
            <context_menu_1.ContextMenuContent className="w-64 bg-background/95 backdrop-blur-lg">
                {menuItems.map((group, groupIndex) => (<div key={groupIndex}>
                        {group.map((item) => (<context_menu_1.ContextMenuItem key={item.label} onClick={item.action} disabled={item.disabled} className="cursor-pointer">
                                <span className={(0, utils_1.cn)('flex w-full items-center gap-1', item.destructive && 'text-red')}>
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                    <span className="ml-auto">
                                        {item.hotkey && <kbd_1.Kbd>{item.hotkey.readableCommand}</kbd_1.Kbd>}
                                    </span>
                                </span>
                            </context_menu_1.ContextMenuItem>))}
                        {groupIndex < menuItems.length - 1 && <context_menu_1.ContextMenuSeparator />}
                    </div>))}
            </context_menu_1.ContextMenuContent>
        </context_menu_1.ContextMenu>);
});
//# sourceMappingURL=index.js.map