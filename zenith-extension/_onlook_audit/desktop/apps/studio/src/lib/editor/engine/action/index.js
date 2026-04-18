"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionManager = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const style_1 = require("@onlook/models/style");
const helpers_1 = require("/common/helpers");
class ActionManager {
    editorEngine;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
    }
    run(action) {
        this.editorEngine.history.push(action);
        this.dispatch(action);
    }
    undo() {
        const action = this.editorEngine.history.undo();
        if (action == null) {
            return;
        }
        this.dispatch(action);
        this.editorEngine.code.write(action);
        (0, utils_1.sendAnalytics)('undo');
    }
    redo() {
        const action = this.editorEngine.history.redo();
        if (action == null) {
            return;
        }
        this.dispatch(action);
        this.editorEngine.code.write(action);
        (0, utils_1.sendAnalytics)('redo');
    }
    dispatch(action) {
        switch (action.type) {
            case 'update-style':
                this.updateStyle(action);
                break;
            case 'insert-element':
                this.insertElement(action);
                break;
            case 'remove-element':
                this.removeElement(action);
                break;
            case 'move-element':
                this.moveElement(action);
                break;
            case 'edit-text':
                this.editText(action);
                break;
            case 'group-elements':
                this.groupElements(action);
                break;
            case 'ungroup-elements':
                this.ungroupElements(action);
                break;
            case 'write-code':
                break;
            case 'insert-image':
                this.insertImage(action);
                break;
            case 'remove-image':
                this.removeImage(action);
                break;
            default:
                (0, helpers_1.assertNever)(action);
        }
    }
    updateStyle({ targets }) {
        targets.forEach((target) => {
            const webview = this.editorEngine.webviews.getWebview(target.webviewId);
            if (!webview) {
                console.error('Failed to get webview');
                return;
            }
            const convertedChange = Object.fromEntries(Object.entries(target.change.updated).map(([key, value]) => {
                const newValue = this.editorEngine.theme.getColorByName(value.value);
                if (value.type === style_1.StyleChangeType.Custom && newValue) {
                    value.value = newValue;
                }
                if (value.type === style_1.StyleChangeType.Custom && !newValue) {
                    value.value = '';
                }
                return [key, value];
            }));
            (0, utils_1.sendToWebview)(webview, constants_1.WebviewChannels.UPDATE_STYLE, {
                domId: target.domId,
                change: {
                    ...target.change,
                    updated: convertedChange,
                },
            });
        });
    }
    insertElement({ targets, element, editText, location }) {
        targets.forEach((elementMetadata) => {
            const webview = this.editorEngine.webviews.getWebview(elementMetadata.webviewId);
            if (!webview) {
                console.error('Failed to get webview');
                return;
            }
            (0, utils_1.sendToWebview)(webview, constants_1.WebviewChannels.INSERT_ELEMENT, {
                element,
                location,
                editText,
            });
        });
    }
    removeElement({ targets, location }) {
        targets.forEach((target) => {
            const webview = this.editorEngine.webviews.getWebview(target.webviewId);
            if (!webview) {
                console.error('Failed to get webview');
                return;
            }
            (0, utils_1.sendToWebview)(webview, constants_1.WebviewChannels.REMOVE_ELEMENT, {
                location,
            });
        });
    }
    moveElement({ targets, location }) {
        targets.forEach((target) => {
            const webview = this.editorEngine.webviews.getWebview(target.webviewId);
            if (!webview) {
                console.error('Failed to get webview');
                return;
            }
            (0, utils_1.sendToWebview)(webview, constants_1.WebviewChannels.MOVE_ELEMENT, {
                domId: target.domId,
                newIndex: location.index,
            });
        });
    }
    editText({ targets, newContent }) {
        targets.forEach((target) => {
            const webview = this.editorEngine.webviews.getWebview(target.webviewId);
            if (!webview) {
                console.error('Failed to get webview');
                return;
            }
            (0, utils_1.sendToWebview)(webview, constants_1.WebviewChannels.EDIT_ELEMENT_TEXT, {
                domId: target.domId,
                content: newContent,
            });
        });
    }
    groupElements({ parent, container, children }) {
        const webview = this.editorEngine.webviews.getWebview(parent.webviewId);
        if (!webview) {
            console.error('Failed to get webview');
            return;
        }
        (0, utils_1.sendToWebview)(webview, constants_1.WebviewChannels.GROUP_ELEMENTS, { parent, container, children });
    }
    ungroupElements({ parent, container, children }) {
        const webview = this.editorEngine.webviews.getWebview(parent.webviewId);
        if (!webview) {
            console.error('Failed to get webview');
            return;
        }
        (0, utils_1.sendToWebview)(webview, constants_1.WebviewChannels.UNGROUP_ELEMENTS, { parent, container, children });
    }
    insertImage({ targets, image }) {
        targets.forEach((target) => {
            const webview = this.editorEngine.webviews.getWebview(target.webviewId);
            if (!webview) {
                console.error('Failed to get webview');
                return;
            }
            (0, utils_1.sendToWebview)(webview, constants_1.WebviewChannels.INSERT_IMAGE, {
                domId: target.domId,
                image,
            });
        });
    }
    removeImage({ targets }) {
        targets.forEach((target) => {
            const webview = this.editorEngine.webviews.getWebview(target.webviewId);
            if (!webview) {
                console.error('Failed to get webview');
                return;
            }
            (0, utils_1.sendToWebview)(webview, constants_1.WebviewChannels.REMOVE_IMAGE, {
                domId: target.domId,
            });
        });
    }
    dispose() { }
}
exports.ActionManager = ActionManager;
//# sourceMappingURL=index.js.map