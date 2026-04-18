"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyleManager = exports.StyleMode = void 0;
const style_1 = require("@onlook/models/style");
const mobx_1 = require("mobx");
const utility_1 = require("@onlook/utility");
var StyleMode;
(function (StyleMode) {
    StyleMode["Instance"] = "instance";
    StyleMode["Root"] = "root";
})(StyleMode || (exports.StyleMode = StyleMode = {}));
class StyleManager {
    editorEngine;
    selectedStyle = null;
    domIdToStyle = new Map();
    prevSelected = '';
    mode = StyleMode.Root;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
        (0, mobx_1.reaction)(() => this.editorEngine.elements.selected, (selectedElements) => this.onSelectedElementsChanged(selectedElements));
    }
    updateCustom(style, value, domIds = []) {
        const styleObj = { [style]: value };
        const action = this.getUpdateStyleAction(styleObj, domIds, style_1.StyleChangeType.Custom);
        this.editorEngine.action.run(action);
        this.updateStyleNoAction(styleObj);
    }
    updateFontFamily(style, value) {
        const styleObj = { [style]: value.id };
        const action = this.getUpdateStyleAction(styleObj);
        const formattedAction = {
            ...action,
            targets: action.targets.map((val) => ({
                ...val,
                change: {
                    original: Object.fromEntries(Object.entries(val.change.original).map(([key, styleChange]) => [
                        key,
                        {
                            ...styleChange,
                            value: (0, utility_1.convertFontString)(styleChange.value),
                        },
                    ])),
                    updated: Object.fromEntries(Object.entries(val.change.updated).map(([key, styleChange]) => [
                        key,
                        {
                            ...styleChange,
                            value: (0, utility_1.convertFontString)(styleChange.value),
                        },
                    ])),
                },
            })),
        };
        this.editorEngine.action.run(formattedAction);
        setTimeout(() => {
            this.editorEngine.webviews.reloadWebviews();
        }, 500);
    }
    update(style, value) {
        const styleObj = { [style]: value };
        const action = this.getUpdateStyleAction(styleObj);
        this.editorEngine.action.run(action);
        this.updateStyleNoAction(styleObj);
    }
    updateMultiple(styles) {
        this.updateStyleNoAction(styles);
        const action = this.getUpdateStyleAction(styles);
        this.editorEngine.action.run(action);
    }
    getUpdateStyleAction(styles, domIds = [], type = style_1.StyleChangeType.Value) {
        const selected = this.editorEngine.elements.selected;
        const filteredSelected = domIds.length > 0 ? selected.filter((el) => domIds.includes(el.domId)) : selected;
        const targets = filteredSelected.map((selectedEl) => {
            const change = {
                updated: type === style_1.StyleChangeType.Custom
                    ? Object.fromEntries(Object.keys(styles).map((style) => [
                        style,
                        { value: styles[style], type: style_1.StyleChangeType.Custom },
                    ]))
                    : Object.fromEntries(Object.keys(styles).map((style) => [
                        style,
                        { value: styles[style], type: style_1.StyleChangeType.Value },
                    ])),
                original: Object.fromEntries(Object.keys(styles).map((style) => [
                    style,
                    {
                        value: selectedEl.styles?.defined[style] ??
                            selectedEl.styles?.computed[style] ??
                            '',
                        type: style_1.StyleChangeType.Value,
                    },
                ])),
            };
            const target = {
                webviewId: selectedEl.webviewId,
                domId: selectedEl.domId,
                oid: this.mode === StyleMode.Instance ? selectedEl.instanceId : selectedEl.oid,
                change: change,
            };
            return target;
        });
        return {
            type: 'update-style',
            targets: targets,
        };
    }
    updateStyleNoAction(styles) {
        for (const [selector, selectedStyle] of this.domIdToStyle.entries()) {
            this.domIdToStyle.set(selector, {
                ...selectedStyle,
                styles: { ...selectedStyle.styles, ...styles },
            });
        }
        if (this.selectedStyle == null) {
            return;
        }
        this.selectedStyle = {
            ...this.selectedStyle,
            styles: { ...this.selectedStyle.styles, ...styles },
        };
    }
    onSelectedElementsChanged(selectedElements) {
        const newSelected = selectedElements
            .map((el) => el.domId)
            .toSorted()
            .join();
        if (newSelected !== this.prevSelected) {
            this.mode = StyleMode.Root;
        }
        this.prevSelected = newSelected;
        if (selectedElements.length === 0) {
            this.domIdToStyle = new Map();
            return;
        }
        const newMap = new Map();
        let newSelectedStyle = null;
        for (const selectedEl of selectedElements) {
            const styles = {
                ...selectedEl.styles?.computed,
                ...selectedEl.styles?.defined,
            };
            const selectedStyle = {
                styles,
                parentRect: selectedEl?.parent?.rect ?? {},
                rect: selectedEl?.rect ?? {},
            };
            newMap.set(selectedEl.domId, selectedStyle);
            if (newSelectedStyle == null) {
                newSelectedStyle = selectedStyle;
            }
        }
        this.domIdToStyle = newMap;
        this.selectedStyle = newSelectedStyle;
    }
    dispose() {
        // Clear state
        this.selectedStyle = null;
        this.domIdToStyle = new Map();
        this.prevSelected = '';
        this.mode = StyleMode.Root;
        // Clear references
        this.editorEngine = null;
    }
}
exports.StyleManager = StyleManager;
//# sourceMappingURL=index.js.map