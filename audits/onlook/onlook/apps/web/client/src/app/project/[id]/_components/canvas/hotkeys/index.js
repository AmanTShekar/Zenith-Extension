"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotkeysArea = void 0;
const hotkey_1 = require("@/components/hotkey");
const editor_1 = require("@/components/store/editor");
const constants_1 = require("@onlook/constants");
const models_1 = require("@onlook/models");
const react_hotkeys_hook_1 = require("react-hotkeys-hook");
const HotkeysArea = ({ children }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    // Zoom
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.ZOOM_FIT.command, () => {
        editorEngine.canvas.scale = constants_1.DefaultSettings.SCALE;
        editorEngine.canvas.position = {
            x: constants_1.DefaultSettings.PAN_POSITION.x,
            y: constants_1.DefaultSettings.PAN_POSITION.y,
        };
    }, { preventDefault: true });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.ZOOM_IN.command, () => (editorEngine.canvas.scale = editorEngine.canvas.scale * 1.2), {
        preventDefault: true,
    });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.ZOOM_OUT.command, () => (editorEngine.canvas.scale = editorEngine.canvas.scale * 0.8), {
        preventDefault: true,
    });
    // Modes
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.SELECT.command, () => (editorEngine.state.editorMode = models_1.EditorMode.DESIGN));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.CODE.command, () => (editorEngine.state.editorMode = models_1.EditorMode.CODE));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.ESCAPE.command, () => {
        editorEngine.state.editorMode = models_1.EditorMode.DESIGN;
        if (!editorEngine.text.isEditing) {
            editorEngine.clearUI();
        }
    });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.PAN.command, () => (editorEngine.state.editorMode = models_1.EditorMode.PAN));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.PREVIEW.command, () => (editorEngine.state.editorMode = models_1.EditorMode.PREVIEW));
    // Quick mode switching with CMD+1/2/3 (overrides browser defaults)
    (0, react_hotkeys_hook_1.useHotkeys)('mod+1', () => (editorEngine.state.editorMode = models_1.EditorMode.DESIGN), { preventDefault: true });
    (0, react_hotkeys_hook_1.useHotkeys)('mod+2', () => (editorEngine.state.editorMode = models_1.EditorMode.CODE), { preventDefault: true });
    (0, react_hotkeys_hook_1.useHotkeys)('mod+3', () => (editorEngine.state.editorMode = models_1.EditorMode.PREVIEW), { preventDefault: true });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.INSERT_DIV.command, () => (editorEngine.state.insertMode = models_1.InsertMode.INSERT_DIV));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.INSERT_TEXT.command, () => (editorEngine.state.insertMode = models_1.InsertMode.INSERT_TEXT));
    (0, react_hotkeys_hook_1.useHotkeys)('space', () => (editorEngine.state.editorMode = models_1.EditorMode.PAN), { keydown: true });
    (0, react_hotkeys_hook_1.useHotkeys)('space', () => (editorEngine.state.editorMode = models_1.EditorMode.DESIGN), { keyup: true });
    (0, react_hotkeys_hook_1.useHotkeys)('alt', () => editorEngine.overlay.showMeasurement(), { keydown: true });
    (0, react_hotkeys_hook_1.useHotkeys)('alt', () => editorEngine.overlay.removeMeasurement(), { keyup: true });
    // Actions
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.UNDO.command, () => editorEngine.action.undo(), {
        preventDefault: true,
    });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.REDO.command, () => editorEngine.action.redo(), {
        preventDefault: true,
    });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.ENTER.command, () => editorEngine.text.editSelectedElement(), { preventDefault: true });
    (0, react_hotkeys_hook_1.useHotkeys)([hotkey_1.Hotkey.BACKSPACE.command, hotkey_1.Hotkey.DELETE.command], () => {
        if (editorEngine.elements.selected.length > 0) {
            editorEngine.elements.delete();
        }
        else if (editorEngine.frames.selected.length > 0 && editorEngine.frames.canDelete()) {
            editorEngine.frames.deleteSelected();
        }
    }, { preventDefault: true });
    // Group
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.GROUP.command, () => editorEngine.group.groupSelectedElements());
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.UNGROUP.command, () => editorEngine.group.ungroupSelectedElement());
    // Copy
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.COPY.command, () => editorEngine.copy.copy(), { preventDefault: true });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.PASTE.command, () => editorEngine.copy.paste(), { preventDefault: true });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.CUT.command, () => editorEngine.copy.cut(), { preventDefault: true });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.DUPLICATE.command, () => {
        if (editorEngine.elements.selected.length > 0) {
            editorEngine.copy.duplicate();
        }
        else if (editorEngine.frames.selected.length > 0 && editorEngine.frames.canDuplicate()) {
            editorEngine.frames.duplicateSelected();
        }
    }, { preventDefault: true });
    // AI
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.ADD_AI_CHAT.command, () => {
        if (editorEngine.state.editorMode === models_1.EditorMode.PREVIEW) {
            editorEngine.state.editorMode = models_1.EditorMode.DESIGN;
        }
        editorEngine.chat.focusChatInput();
    });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.NEW_AI_CHAT.command, () => {
        editorEngine.state.editorMode = models_1.EditorMode.DESIGN;
        editorEngine.chat.conversation.startNewConversation();
    });
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.CHAT_MODE_TOGGLE.command, () => {
        // Toggle between design and preview mode
        if (editorEngine.state.editorMode === models_1.EditorMode.PREVIEW) {
            editorEngine.state.editorMode = models_1.EditorMode.DESIGN;
        }
        else {
            editorEngine.state.editorMode = models_1.EditorMode.PREVIEW;
        }
    }, { preventDefault: true });
    // Move
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.MOVE_LAYER_UP.command, () => editorEngine.move.moveSelected('up'));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.MOVE_LAYER_DOWN.command, () => editorEngine.move.moveSelected('down'));
    (0, react_hotkeys_hook_1.useHotkeys)(hotkey_1.Hotkey.SHOW_HOTKEYS.command, () => (editorEngine.state.hotkeysOpen = !editorEngine.state.hotkeysOpen));
    return (<>
            {children}
        </>);
};
exports.HotkeysArea = HotkeysArea;
//# sourceMappingURL=index.js.map