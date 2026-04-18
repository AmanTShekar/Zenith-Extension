"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextEditingManager = void 0;
const mobx_1 = require("mobx");
const utils_1 = require("../overlay/utils");
class TextEditingManager {
    editorEngine;
    targetDomEl = null;
    originalContent = null;
    shouldNotStartEditing = false;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    get isEditing() {
        return this.targetDomEl !== null;
    }
    get targetElement() {
        return this.targetDomEl;
    }
    async start(el, frameView) {
        try {
            const isEditable = (await frameView.isChildTextEditable(el.oid ?? ''));
            if (isEditable !== true) {
                throw new Error(isEditable === null
                    ? "Can't determine if text is editable"
                    : "Can't edit text because it's not plain text. Edit in code or use AI.");
            }
            const res = (await frameView.startEditingText(el.domId));
            if (!res) {
                throw new Error('Failed to start editing text, no result returned');
            }
            const computedStyles = (await frameView.getComputedStyleByDomId(el.domId));
            if (!computedStyles) {
                throw new Error('Failed to get computed styles for text editing');
            }
            const { originalContent } = res;
            this.targetDomEl = el;
            this.originalContent = originalContent;
            this.shouldNotStartEditing = true;
            this.editorEngine.history.startTransaction();
            const adjustedRect = (0, utils_1.adaptRectToCanvas)(el.rect, frameView);
            const isComponent = el.instanceId !== null;
            this.editorEngine.overlay.clearUI();
            this.editorEngine.overlay.state.addTextEditor(adjustedRect, this.originalContent, el.styles?.computed ?? {}, (content) => {
                this.edit(content);
            }, () => {
                this.end();
            }, isComponent);
        }
        catch (error) {
            console.error('Error starting text edit:', error);
        }
    }
    async edit(newContent) {
        try {
            if (!this.targetDomEl) {
                throw new Error('No target dom element to edit');
            }
            const frameData = this.editorEngine.frames.get(this.targetDomEl.frameId);
            if (!frameData?.view) {
                throw new Error('No frameView found for text editing');
            }
            const res = await frameData.view.editText(this.targetDomEl.domId, newContent);
            if (!res) {
                throw new Error('Failed to edit text. No dom element returned');
            }
            await this.handleEditedText(res.domEl, newContent, frameData.view);
        }
        catch (error) {
            console.error('Error editing text:', error);
        }
    }
    async end() {
        try {
            if (!this.targetDomEl) {
                throw new Error('No target dom element to stop editing');
            }
            const frameData = this.editorEngine.frames.get(this.targetDomEl.frameId);
            if (!frameData?.view) {
                throw new Error('No frameView found for end text editing');
            }
            const res = await frameData.view.stopEditingText(this.targetDomEl.domId);
            if (!res) {
                throw new Error('Failed to stop editing text. No result returned');
            }
            const { newContent, domEl } = res;
            await this.handleEditedText(domEl, newContent, frameData.view);
            await this.clean();
        }
        catch (error) {
            console.error('Error ending text edit:', error);
        }
    }
    async clean() {
        if (this.targetDomEl) {
            try {
                const frameData = this.editorEngine.frames.get(this.targetDomEl.frameId);
                await frameData?.view?.stopEditingText(this.targetDomEl.domId);
            }
            catch (error) {
                console.error('Error stopping editing text:', error);
            }
        }
        this.targetDomEl = null;
        this.editorEngine.overlay.state.removeTextEditor();
        await this.editorEngine.history.commitTransaction();
        this.shouldNotStartEditing = false;
    }
    async handleEditedText(domEl, newContent, frameView) {
        try {
            await this.editorEngine.history.push({
                type: 'edit-text',
                targets: [
                    {
                        frameId: frameView.id,
                        branchId: domEl.branchId,
                        domId: domEl.domId,
                        oid: domEl.oid,
                    },
                ],
                originalContent: this.originalContent ?? '',
                newContent,
            });
            const adjustedRect = (0, utils_1.adaptRectToCanvas)(domEl.rect, frameView);
            this.editorEngine.overlay.state.updateTextEditor(adjustedRect, {
                content: newContent,
            });
            await this.editorEngine.overlay.refresh();
        }
        catch (error) {
            console.error('Error handling edited text:', error);
        }
    }
    async editSelectedElement() {
        if (this.shouldNotStartEditing) {
            return;
        }
        try {
            const selected = this.editorEngine.elements.selected;
            if (selected.length === 0) {
                console.error('No selected elements found');
                return;
            }
            const selectedEl = selected[0];
            if (!selectedEl) {
                console.error('No selected element found');
                return;
            }
            const frameData = this.editorEngine.frames.get(selectedEl.frameId);
            if (!frameData?.view) {
                console.error('No frameView found for selected element');
                return;
            }
            const domEl = await frameData.view.getElementByDomId(selectedEl.domId, true);
            if (!domEl) {
                return;
            }
            await this.start(domEl, frameData.view);
        }
        catch (error) {
            console.error('Error editing selected element:', error);
            return;
        }
    }
    async editElementAtLoc(pos, frameView) {
        try {
            const el = (await frameView.getElementAtLoc(pos.x, pos.y, true));
            if (!el) {
                console.error('Failed to get element at location');
                return;
            }
            await this.start(el, frameView);
        }
        catch (error) {
            console.error('Error editing element at location:', error);
            return;
        }
    }
}
exports.TextEditingManager = TextEditingManager;
//# sourceMappingURL=index.js.map