"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeftPanel = void 0;
const editor_1 = require("@/components/store/editor");
const models_1 = require("@onlook/models");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const code_panel_1 = require("./code-panel");
const design_panel_1 = require("./design-panel");
exports.LeftPanel = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    return <>
        <div className={(0, utils_1.cn)('size-full', editorEngine.state.editorMode !== models_1.EditorMode.DESIGN && editorEngine.state.editorMode !== models_1.EditorMode.PAN && 'hidden')}>
            <design_panel_1.DesignPanel />
        </div>
        <div className={(0, utils_1.cn)('size-full', editorEngine.state.editorMode !== models_1.EditorMode.CODE && 'hidden')}>
            <code_panel_1.CodePanel />
        </div>
    </>;
});
//# sourceMappingURL=index.js.map