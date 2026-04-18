"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodePanel = void 0;
const editor_1 = require("@/components/store/editor");
const models_1 = require("@onlook/models");
const resizable_1 = require("@onlook/ui/resizable");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const code_tab_1 = require("./code-tab");
exports.CodePanel = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const editPanelWidth = 500;
    return (<div className={(0, utils_1.cn)('flex size-full transition-width duration-300 bg-background/95 group/panel border-[0.5px] backdrop-blur-xl shadow rounded-tr-xl overflow-hidden', editorEngine.state.editorMode !== models_1.EditorMode.CODE && 'hidden')}>
            <resizable_1.ResizablePanel side="left" defaultWidth={editPanelWidth} minWidth={240} maxWidth={1440}>
                <code_tab_1.CodeTab projectId={editorEngine.projectId} branchId={editorEngine.branches.activeBranch.id}/>
            </resizable_1.ResizablePanel>
        </div>);
});
//# sourceMappingURL=index.js.map