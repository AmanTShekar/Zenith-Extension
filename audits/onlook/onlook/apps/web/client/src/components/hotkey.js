"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hotkey = void 0;
const utility_1 = require("@onlook/utility");
class Hotkey {
    command;
    description;
    // Modes
    static SELECT = new Hotkey('v', 'Select');
    static CODE = new Hotkey('c', 'Code');
    static ESCAPE = new Hotkey('esc', 'Escape');
    static PAN = new Hotkey('h', 'Pan');
    static PREVIEW = new Hotkey('p', 'Preview');
    static INSERT_DIV = new Hotkey('r', 'Insert Div');
    static RELOAD_APP = new Hotkey('mod+r', 'Reload App');
    // Zoom
    static ZOOM_FIT = new Hotkey('mod+0', 'Zoom Fit');
    static ZOOM_IN = new Hotkey('mod+equal', 'Zoom In');
    static ZOOM_OUT = new Hotkey('mod+minus', 'Zoom Out');
    // Actions
    static UNDO = new Hotkey('mod+z', 'Undo');
    static REDO = new Hotkey('mod+shift+z', 'Redo');
    static GROUP = new Hotkey('mod+g', 'Group');
    static UNGROUP = new Hotkey('mod+shift+g', 'Ungroup');
    static OPEN_DEV_TOOL = new Hotkey('mod+shift+i', 'Open Devtool');
    static ADD_AI_CHAT = new Hotkey('mod+shift+l', 'Add to AI chat');
    static NEW_AI_CHAT = new Hotkey('mod+l', 'New AI Chat');
    static CHAT_MODE_TOGGLE = new Hotkey('mod+period', 'Open Chat Mode Menu');
    static MOVE_LAYER_UP = new Hotkey('shift+arrowup', 'Move Layer Up');
    static MOVE_LAYER_DOWN = new Hotkey('shift+arrowdown', 'Move Layer Down');
    static SHOW_HOTKEYS = new Hotkey('mod+k', 'Show Shortcuts');
    // Text
    static INSERT_TEXT = new Hotkey('t', 'Insert Text');
    static ENTER = new Hotkey('enter', 'Edit Text');
    // Copy
    static COPY = new Hotkey('mod+c', 'Copy');
    static PASTE = new Hotkey('mod+v', 'Paste');
    static CUT = new Hotkey('mod+x', 'Cut');
    static DUPLICATE = new Hotkey('mod+d', 'Duplicate');
    // Delete
    static BACKSPACE = new Hotkey('backspace', 'Delete');
    static DELETE = new Hotkey('delete', 'Delete');
    // private to disallow creating other instances of this type
    constructor(command, description) {
        this.command = command;
        this.description = description;
    }
    toString() {
        return this.command;
    }
    get readableCommand() {
        const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        return this.command
            .replace('mod', isMac ? '⌘' : 'Ctrl')
            .split('+')
            .map((value) => {
            if (value === 'shift') {
                return '⇧';
            }
            if (value === 'alt') {
                return isMac ? '⌥' : 'Alt';
            }
            if (value === 'ctrl') {
                return isMac ? '⌃' : 'Ctrl';
            }
            if (value === 'equal') {
                return '=';
            }
            if (value === 'minus') {
                return '-';
            }
            if (value === 'plus') {
                return '+';
            }
            if (value === 'period') {
                return '.';
            }
            return (0, utility_1.capitalizeFirstLetter)(value);
        })
            .join(' ');
    }
}
exports.Hotkey = Hotkey;
//# sourceMappingURL=hotkey.js.map