"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotkeysArea = void 0;
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const constants_1 = require("@onlook/models/constants");
const react_hotkeys_hook_1 = require("react-hotkeys-hook");
const Delete_1 = require("./Delete");
const hotkeys_1 = require("/common/hotkeys");
const HotkeysArea = ({ children }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    // Zoom
    (0, react_hotkeys_hook_1.useHotkeys)('mod+0', () => {
        editorEngine.canvas.scale = constants_1.DefaultSettings.SCALE;
        editorEngine.canvas.position = {
            x: constants_1.DefaultSettings.PAN_POSITION.x,
            y: constants_1.DefaultSettings.PAN_POSITION.y,
        };
    }, { preventDefault: true });
    (0, react_hotkeys_hook_1.useHotkeys)('mod+equal', () => (editorEngine.canvas.scale = editorEngine.canvas.scale * 1.2), {
        preventDefault: true,
    });
    (0, react_hotkeys_hook_1.useHotkeys)('mod+minus', () => (editorEngine.canvas.scale = editorEngine.canvas.scale * 0.8), {
        preventDefault: true,
    });
    // Modes
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.SELECT.command, () => (editorEngine.mode = models_1.EditorMode.DESIGN));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.ESCAPE.command, () => {
        editorEngine.mode = models_1.EditorMode.DESIGN;
        !editorEngine.text.isEditing && editorEngine.clearUI();
    });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.PAN.command, () => (editorEngine.mode = models_1.EditorMode.PAN));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.PREVIEW.command, () => (editorEngine.mode = models_1.EditorMode.PREVIEW));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.INSERT_DIV.command, () => (editorEngine.mode = models_1.EditorMode.INSERT_DIV));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.INSERT_TEXT.command, () => (editorEngine.mode = models_1.EditorMode.INSERT_TEXT));
    (0, react_hotkeys_hook_1.useHotkeys)('space', () => (editorEngine.mode = models_1.EditorMode.PAN), { keydown: true });
    (0, react_hotkeys_hook_1.useHotkeys)('space', () => (editorEngine.mode = models_1.EditorMode.DESIGN), { keyup: true });
    (0, react_hotkeys_hook_1.useHotkeys)('alt', () => editorEngine.elements.showMeasurement(), { keydown: true });
    (0, react_hotkeys_hook_1.useHotkeys)('alt', () => editorEngine.overlay.removeMeasurement(), { keyup: true });
    // Actions
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.UNDO.command, () => editorEngine.action.undo());
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.REDO.command, () => editorEngine.action.redo());
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.ENTER.command, () => editorEngine.text.editSelectedElement());
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.REFRESH_LAYERS.command, () => editorEngine.refreshLayers());
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.OPEN_DEV_TOOL.command, () => editorEngine.inspect());
    // Group
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.GROUP.command, () => editorEngine.group.groupSelectedElements());
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.UNGROUP.command, () => editorEngine.group.ungroupSelectedElement());
    // Copy
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.COPY.command, () => editorEngine.copy.copy());
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.PASTE.command, () => editorEngine.copy.paste());
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.CUT.command, () => editorEngine.copy.cut());
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.DUPLICATE.command, () => {
        if (editorEngine.isWindowSelected) {
            editorEngine.duplicateWindow();
        }
        else {
            editorEngine.copy.duplicate();
        }
    });
    // AI
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.ADD_AI_CHAT.command, () => (editorEngine.editPanelTab = models_1.EditorTabValue.CHAT));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.NEW_AI_CHAT.command, () => {
        editorEngine.editPanelTab = models_1.EditorTabValue.CHAT;
        editorEngine.chat.conversation.startNewConversation();
    });
    // Move
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.MOVE_LAYER_UP.command, () => editorEngine.move.moveSelected('up'));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.MOVE_LAYER_DOWN.command, () => editorEngine.move.moveSelected('down'));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkeys_1.Hotkey.SHOW_HOTKEYS.command, () => {
        editorEngine.isHotkeysOpen = !editorEngine.isHotkeysOpen;
    });
    return (<>
            <Delete_1.DeleteKey />
            {children}
        </>);
};
exports.HotkeysArea = HotkeysArea;
//# sourceMappingURL=index.js.map