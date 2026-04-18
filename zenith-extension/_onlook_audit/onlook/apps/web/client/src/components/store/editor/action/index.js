"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionManager = void 0;
const models_1 = require("@onlook/models");
const style_1 = require("@onlook/models/style");
const utility_1 = require("@onlook/utility");
const lodash_1 = require("lodash");
class ActionManager {
    editorEngine;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
    }
    async run(action) {
        await this.editorEngine.history.push(action);
        await this.dispatch(action);
    }
    async undo() {
        const action = this.editorEngine.history.undo();
        if (action == null) {
            return;
        }
        await this.editorEngine.code.write(action);
        this.editorEngine.posthog.capture('undo');
    }
    async redo() {
        const action = this.editorEngine.history.redo();
        if (action == null) {
            return;
        }
        await this.editorEngine.code.write(action);
        this.editorEngine.posthog.capture('redo');
    }
    async dispatch(action) {
        switch (action.type) {
            case 'update-style':
                await this.updateStyle(action);
                break;
            case 'insert-element':
                // Disabling real-time insert since this is buggy. Will still work but not as fast.
                // await this.insertElement(action);
                break;
            case 'remove-element':
                await this.removeElement(action);
                break;
            case 'move-element':
                await this.moveElement(action);
                break;
            case 'edit-text':
                await this.editText(action);
                break;
            case 'group-elements':
                await this.groupElements(action);
                break;
            case 'ungroup-elements':
                await this.ungroupElements(action);
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
                (0, utility_1.assertNever)(action);
        }
    }
    async updateStyle({ targets }) {
        const domEls = [];
        for (const target of targets) {
            const frameData = this.editorEngine.frames.get(target.frameId);
            if (!frameData) {
                console.error('Failed to get frameView');
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
            const change = {
                original: target.change.original,
                updated: convertedChange,
            };
            if (!frameData.view) {
                console.error('No frame view found');
                continue;
            }
            // cloneDeep is used to avoid the issue of observable values can not pass through the webview
            const domEl = await frameData.view.updateStyle(target.domId, (0, lodash_1.cloneDeep)(change));
            if (!domEl) {
                console.error('Failed to update style');
                continue;
            }
            domEls.push(domEl);
        }
        this.refreshDomElement(domEls);
    }
    debouncedRefreshDomElement(domEls) {
        this.editorEngine.elements.click(domEls);
    }
    refreshDomElement = (0, lodash_1.debounce)(this.debouncedRefreshDomElement, 100, { leading: true });
    async insertElement({ targets, element, editText, location }) {
        for (const elementMetadata of targets) {
            const frameData = this.editorEngine.frames.get(elementMetadata.frameId);
            if (!frameData?.view) {
                console.error('Failed to get frameView');
                return;
            }
            try {
                const result = await frameData.view.insertElement(element, location);
                if (!result) {
                    console.error('Failed to insert element');
                    return;
                }
                this.refreshAndClickMutatedElement(result.domEl, frameData, result.newMap);
            }
            catch (err) {
                console.error('Error inserting element:', err);
            }
        }
    }
    async removeElement({ targets, location }) {
        for (const target of targets) {
            const frameData = this.editorEngine.frames.get(target.frameId);
            if (!frameData?.view) {
                console.error('Failed to get frameView');
                return;
            }
            const result = await frameData.view.removeElement(location);
            if (!result) {
                console.error('Failed to remove element');
                return;
            }
            await this.editorEngine.overlay.refresh();
            this.refreshAndClickMutatedElement(result.domEl, frameData, result.newMap);
        }
    }
    async moveElement({ targets, location }) {
        for (const target of targets) {
            const frameData = this.editorEngine.frames.get(target.frameId);
            if (!frameData?.view) {
                console.error('Failed to get frameView');
                return;
            }
            const result = await frameData.view.moveElement(target.domId, location.index);
            if (!result) {
                console.error('Failed to move element');
                return;
            }
            this.refreshAndClickMutatedElement(result.domEl, frameData, result.newMap);
        }
    }
    async editText({ targets, newContent }) {
        for (const target of targets) {
            const frameData = this.editorEngine.frames.get(target.frameId);
            if (!frameData?.view) {
                console.error('Failed to get frameView');
                return;
            }
            const result = await frameData.view.editText(target.domId, newContent);
            if (!result) {
                console.error('Failed to edit text');
                return;
            }
            this.refreshAndClickMutatedElement(result.domEl, frameData, result.newMap);
        }
    }
    async groupElements({ parent, container, children }) {
        const frameData = this.editorEngine.frames.get(parent.frameId);
        if (!frameData?.view) {
            console.error('Failed to get frameView');
            return;
        }
        const result = await frameData.view.groupElements(parent, container, children);
        if (!result) {
            console.error('Failed to group elements');
            return;
        }
        this.refreshAndClickMutatedElement(result.domEl, frameData, result.newMap);
    }
    async ungroupElements({ parent, container }) {
        const frameData = this.editorEngine.frames.get(parent.frameId);
        if (!frameData?.view) {
            console.error('Failed to get frameView');
            return;
        }
        const result = await frameData.view.ungroupElements(parent, container);
        if (!result) {
            console.error('Failed to ungroup elements');
            return;
        }
        this.refreshAndClickMutatedElement(result.domEl, frameData, result.newMap);
    }
    insertImage({ targets, image }) {
        targets.forEach((target) => {
            const frameView = this.editorEngine.frames.get(target.frameId);
            if (!frameView) {
                console.error('Failed to get frameView');
                return;
            }
            // sendToWebview(frameView, WebviewChannels.INSERT_IMAGE, {
            //     domId: target.domId,
            //     image,
            // });
        });
    }
    removeImage({ targets }) {
        targets.forEach((target) => {
            const frameData = this.editorEngine.frames.get(target.frameId);
            if (!frameData) {
                console.error('Failed to get frameView');
                return;
            }
            // sendToWebview(frameView, WebviewChannels.REMOVE_IMAGE, {
            //     domId: target.domId,
            // });
        });
    }
    async refreshAndClickMutatedElement(domEl, frameData, newMap) {
        this.editorEngine.state.editorMode = models_1.EditorMode.DESIGN;
        this.editorEngine.elements.click([domEl]);
        if (newMap) {
            this.editorEngine.ast.updateMap(frameData.frame.id, newMap, domEl.domId);
        }
    }
    clear() { }
}
exports.ActionManager = ActionManager;
//# sourceMappingURL=index.js.map