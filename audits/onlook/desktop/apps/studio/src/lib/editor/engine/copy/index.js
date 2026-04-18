"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyManager = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
class CopyManager {
    editorEngine;
    copied = null;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    async copy() {
        const selected = this.editorEngine.elements.selected;
        if (selected.length === 0) {
            return;
        }
        const selectedEl = this.editorEngine.elements.selected[0];
        const webviewId = selectedEl.webviewId;
        const webview = this.editorEngine.webviews.getWebview(webviewId);
        if (!webview) {
            console.error('Failed to get webview');
            return;
        }
        const targetEl = await webview.executeJavaScript(`window.api?.getActionElementByDomId('${selectedEl.domId}')`);
        if (!targetEl) {
            console.error('Failed to copy element');
            return;
        }
        const codeBlock = await this.editorEngine.code.getCodeBlock(selectedEl.oid);
        this.copied = { element: targetEl, codeBlock };
        this.clearClipboard();
    }
    clearClipboard() {
        try {
            navigator.clipboard.writeText('');
        }
        catch (error) {
            console.warn('Failed to clear clipboard:', error);
        }
    }
    async paste() {
        const selected = this.editorEngine.elements.selected;
        if (selected.length === 0) {
            return;
        }
        if (await this.pasteImageFromClipboard()) {
            return;
        }
        if (!this.copied) {
            console.warn('Nothing to paste');
            return;
        }
        const selectedEl = this.editorEngine.elements.selected[0];
        const targets = this.editorEngine.elements.selected.map((selectedEl) => {
            const target = {
                webviewId: selectedEl.webviewId,
                domId: selectedEl.domId,
                oid: selectedEl.oid,
            };
            return target;
        });
        const location = await this.getInsertLocation(selectedEl);
        if (!location) {
            console.error('Failed to get insert location');
            return;
        }
        const newOid = (0, utils_1.createOid)();
        const newDomId = (0, utils_1.createDomId)();
        const action = {
            type: 'insert-element',
            targets: targets,
            element: this.getCleanedCopyEl(this.copied.element, newDomId, newOid),
            location,
            editText: null,
            pasteParams: {
                oid: newOid,
                domId: newDomId,
            },
            codeBlock: this.copied.codeBlock,
        };
        this.editorEngine.action.run(action);
    }
    async pasteImageFromClipboard() {
        try {
            const clipboard = await navigator.clipboard.read();
            for (const item of clipboard) {
                const imageType = item.types.find((type) => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        const base64data = reader.result;
                        this.editorEngine.image.insert(base64data, imageType);
                    };
                    return true;
                }
            }
        }
        catch (error) {
            console.error('Failed to read clipboard:', error);
        }
        return false;
    }
    getCleanedCopyEl(copiedEl, domId, oid) {
        const filteredAttr = {
            class: copiedEl.attributes['class'] || '',
            [constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID]: domId,
            [constants_1.EditorAttributes.DATA_ONLOOK_ID]: oid,
            [constants_1.EditorAttributes.DATA_ONLOOK_INSERTED]: 'true',
        };
        // Process children recursively
        const processedChildren = copiedEl.children?.map((child) => {
            const newChildDomId = (0, utils_1.createDomId)();
            const newChildOid = (0, utils_1.createOid)();
            return this.getCleanedCopyEl(child, newChildDomId, newChildOid);
        });
        return {
            ...copiedEl,
            attributes: filteredAttr,
            children: processedChildren || [],
        };
    }
    async cut() {
        await this.copy();
        this.editorEngine.elements.delete();
    }
    async duplicate() {
        const savedCopied = this.copied;
        await this.copy();
        await this.paste();
        this.copied = savedCopied;
    }
    clear() {
        this.copied = null;
    }
    async getInsertLocation(selectedEl) {
        const webviewId = selectedEl.webviewId;
        const webview = this.editorEngine.webviews.getWebview(webviewId);
        if (!webview) {
            console.error('Failed to get webview');
            return;
        }
        const insertAsSibling = selectedEl.tagName === 'img' ||
            selectedEl.domId === this.copied?.element.domId ||
            selectedEl.oid === this.copied?.element.oid;
        if (insertAsSibling) {
            const location = await webview.executeJavaScript(`window.api?.getActionLocation('${selectedEl.domId}')`);
            if (!location) {
                console.error('Failed to get location');
                return;
            }
            // Insert as sibling after the selected element
            if (location.type === 'index') {
                location.index += 1;
            }
            return location;
        }
        else {
            return {
                type: 'append',
                targetDomId: selectedEl.domId,
                targetOid: selectedEl.instanceId || selectedEl.oid,
            };
        }
    }
    dispose() {
        // Clear state
        this.clear();
        // Clear references
        this.editorEngine = null;
    }
}
exports.CopyManager = CopyManager;
//# sourceMappingURL=index.js.map