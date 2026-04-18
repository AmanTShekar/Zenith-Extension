"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementManager = void 0;
const use_toast_1 = require("@onlook/ui/use-toast");
const mobx_1 = require("mobx");
const utils_1 = require("../overlay/utils");
class ElementManager {
    editorEngine;
    hoveredElement;
    selectedElements = [];
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this, {});
    }
    get hovered() {
        return this.hoveredElement;
    }
    get selected() {
        return this.selectedElements;
    }
    set selected(elements) {
        this.selectedElements = elements;
    }
    mouseover(domEl, webview) {
        if (!domEl) {
            this.editorEngine.overlay.state.updateHoverRect(null);
            this.clearHoveredElement();
            return;
        }
        if (this.hoveredElement && this.hoveredElement.domId === domEl.domId) {
            return;
        }
        const webviewEl = {
            ...domEl,
            webviewId: webview.id,
        };
        const adjustedRect = (0, utils_1.adaptRectToCanvas)(webviewEl.rect, webview);
        const isComponent = !!domEl.instanceId;
        this.editorEngine.overlay.state.updateHoverRect(adjustedRect, isComponent);
        this.setHoveredElement(webviewEl);
    }
    showMeasurement() {
        this.editorEngine.overlay.removeMeasurement();
        if (!this.selected.length || !this.hovered) {
            return;
        }
        const selectedEl = this.selected[0];
        const hoverEl = this.hovered;
        const webViewId = selectedEl.webviewId;
        const webview = this.editorEngine.webviews.getWebview(webViewId);
        if (!webview) {
            return;
        }
        const selectedRect = (0, utils_1.adaptRectToCanvas)(selectedEl.rect, webview);
        const hoverRect = (0, utils_1.adaptRectToCanvas)(hoverEl.rect, webview);
        this.editorEngine.overlay.updateMeasurement(selectedRect, hoverRect);
    }
    shiftClick(domEl, webview) {
        const selectedEls = this.selected;
        const isAlreadySelected = selectedEls.some((el) => el.domId === domEl.domId);
        let newSelectedEls = [];
        if (isAlreadySelected) {
            newSelectedEls = selectedEls.filter((el) => el.domId !== domEl.domId);
        }
        else {
            newSelectedEls = [...selectedEls, domEl];
        }
        this.click(newSelectedEls, webview);
    }
    click(domEls, webview) {
        this.editorEngine.overlay.state.removeClickRects();
        this.clearSelectedElements();
        for (const domEl of domEls) {
            const adjustedRect = (0, utils_1.adaptRectToCanvas)(domEl.rect, webview);
            const isComponent = !!domEl.instanceId;
            this.editorEngine.overlay.state.addClickRect(adjustedRect, domEl.styles, isComponent);
            this.addSelectedElement(domEl);
        }
    }
    async refreshSelectedElements(webview) {
        const newSelected = [];
        for (const el of this.selected) {
            const newEl = await webview.executeJavaScript(`window.api?.getDomElementByDomId('${el.domId}', true)`);
            if (!newEl) {
                console.error('Element not found');
                continue;
            }
            newSelected.push(newEl);
        }
        this.click(newSelected, webview);
    }
    setHoveredElement(element) {
        this.hoveredElement = element;
    }
    clearHoveredElement() {
        this.hoveredElement = undefined;
    }
    addSelectedElement(element) {
        this.selectedElements.push(element);
    }
    clear() {
        this.clearHoveredElement();
        this.clearSelectedElements();
    }
    clearSelectedElements() {
        this.selectedElements = [];
    }
    async delete() {
        const selected = this.selected;
        if (selected.length === 0) {
            return;
        }
        for (const selectedEl of selected) {
            const webviewId = selectedEl.webviewId;
            const webview = this.editorEngine.webviews.getWebview(webviewId);
            if (!webview) {
                return;
            }
            const { shouldDelete, error } = await this.shouldDelete(selectedEl, webview);
            if (!shouldDelete) {
                (0, use_toast_1.toast)({
                    title: 'Cannot delete element',
                    description: error,
                    variant: 'destructive',
                });
                return;
            }
            const removeAction = (await webview.executeJavaScript(`window.api?.getRemoveActionFromDomId('${selectedEl.domId}', '${webviewId}')`));
            if (!removeAction) {
                console.error('Remove action not found');
                (0, use_toast_1.toast)({
                    title: 'Cannot delete element',
                    description: 'Remove action not found. Try refreshing the page.',
                    variant: 'destructive',
                });
                return;
            }
            const oid = selectedEl.instanceId || selectedEl.oid;
            const codeBlock = await this.editorEngine.code.getCodeBlock(oid);
            if (!codeBlock) {
                (0, use_toast_1.toast)({
                    title: 'Cannot delete element',
                    description: 'Code block not found. Try refreshing the page.',
                    variant: 'destructive',
                });
                return;
            }
            removeAction.codeBlock = codeBlock;
            this.editorEngine.action.run(removeAction);
        }
    }
    async shouldDelete(selectedEl, webview) {
        const instanceId = selectedEl.instanceId;
        if (!instanceId) {
            const { dynamicType, coreType, } = await webview.executeJavaScript(`window.api?.getElementType('${selectedEl.domId}')`);
            if (coreType) {
                const CORE_ELEMENTS_MAP = {
                    'component-root': 'Component Root',
                    'body-tag': 'Body Tag',
                };
                return {
                    shouldDelete: false,
                    error: `This is a ${CORE_ELEMENTS_MAP[coreType]} and cannot be deleted`,
                };
            }
            if (dynamicType) {
                const DYNAMIC_TYPES_MAP = {
                    array: 'Array',
                    conditional: 'Conditional',
                    unknown: 'Unknown',
                };
                return {
                    shouldDelete: false,
                    error: `This element is a(n) ${DYNAMIC_TYPES_MAP[dynamicType]} and cannot be deleted`,
                };
            }
        }
        return {
            shouldDelete: true,
        };
    }
}
exports.ElementManager = ElementManager;
//# sourceMappingURL=index.js.map