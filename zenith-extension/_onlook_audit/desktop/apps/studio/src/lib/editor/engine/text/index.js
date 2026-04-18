"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextEditingManager = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const use_toast_1 = require("@onlook/ui/use-toast");
const js_string_escape_1 = __importDefault(require("js-string-escape"));
const utils_2 = require("../overlay/utils");
class TextEditingManager {
    editorEngine;
    targetDomEl = null;
    originalContent = null;
    shouldNotStartEditing = false;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
    }
    get isEditing() {
        return this.targetDomEl !== null;
    }
    async start(el, webview) {
        const isEditable = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.IS_CHILD_TEXT_EDITABLE, { oid: el.oid });
        if (isEditable !== true) {
            (0, use_toast_1.toast)({
                title: isEditable === null
                    ? "Can't determine if text is editable"
                    : "Can't edit text because it's not plain text. Edit in code or use AI.",
                variant: 'destructive',
            });
            return;
        }
        const res = await webview.executeJavaScript(`window.api?.startEditingText('${el.domId}')`);
        if (!res) {
            console.error('Failed to start editing text, no result returned');
            return;
        }
        const { originalContent } = res;
        this.targetDomEl = el;
        this.originalContent = originalContent;
        this.shouldNotStartEditing = true;
        this.editorEngine.history.startTransaction();
        const adjustedRect = (0, utils_2.adaptRectToCanvas)(this.targetDomEl.rect, webview);
        const isComponent = this.targetDomEl.instanceId !== null;
        this.editorEngine.overlay.clear();
        this.editorEngine.overlay.state.addTextEditor(adjustedRect, this.originalContent, el.styles?.computed ?? {}, (content) => this.edit(content), () => this.end(), isComponent);
    }
    async edit(newContent) {
        if (!this.targetDomEl) {
            console.error('No target dom element to edit');
            return;
        }
        const webview = this.editorEngine.webviews.getWebview(this.targetDomEl.webviewId);
        if (!webview) {
            console.error('No webview found for text editing');
            return;
        }
        const domEl = await webview.executeJavaScript(`window.api?.editText('${this.targetDomEl.domId}', '${(0, js_string_escape_1.default)(newContent)}')`);
        if (!domEl) {
            console.error('Failed to edit text. No dom element returned');
            return;
        }
        this.handleEditedText(domEl, newContent, webview);
    }
    async end() {
        if (!this.targetDomEl) {
            console.error('No target dom element to stop editing');
            return;
        }
        const webview = this.editorEngine.webviews.getWebview(this.targetDomEl.webviewId);
        if (!webview) {
            console.error('No webview found for end text editing');
            return;
        }
        const res = await webview.executeJavaScript(`window.api?.stopEditingText('${this.targetDomEl.domId}')`);
        if (!res) {
            console.error('Failed to stop editing text. No result returned');
            return;
        }
        const { newContent, domEl } = res;
        this.handleEditedText(domEl, newContent, webview);
        this.clean();
    }
    clean() {
        this.targetDomEl = null;
        this.editorEngine.overlay.state.removeTextEditor();
        this.editorEngine.history.commitTransaction();
        this.shouldNotStartEditing = false;
    }
    handleEditedText(domEl, newContent, webview) {
        this.editorEngine.history.push({
            type: 'edit-text',
            targets: [
                {
                    webviewId: webview.id,
                    domId: domEl.domId,
                    oid: domEl.oid,
                },
            ],
            originalContent: this.originalContent ?? '',
            newContent,
        });
        this.editorEngine.overlay.refreshOverlay();
    }
    async editSelectedElement() {
        if (this.shouldNotStartEditing) {
            return;
        }
        const selected = this.editorEngine.elements.selected;
        if (selected.length === 0) {
            return;
        }
        const selectedEl = selected[0];
        const webviewId = selectedEl.webviewId;
        const webview = this.editorEngine.webviews.getWebview(webviewId);
        if (!webview) {
            return;
        }
        const domEl = await webview.executeJavaScript(`window.api?.getDomElementByDomId('${selectedEl.domId}', true)`);
        if (!domEl) {
            return;
        }
        this.start(domEl, webview);
    }
    async editElementAtLoc(pos, webview) {
        const el = await webview.executeJavaScript(`window.api?.getElementAtLoc(${pos.x}, ${pos.y}, true)`);
        if (!el) {
            console.error('Failed to get element at location');
            return;
        }
        this.start(el, webview);
    }
}
exports.TextEditingManager = TextEditingManager;
//# sourceMappingURL=index.js.map