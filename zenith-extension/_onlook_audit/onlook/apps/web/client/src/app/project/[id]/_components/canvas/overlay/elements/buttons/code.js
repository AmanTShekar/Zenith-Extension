"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayOpenCode = void 0;
const editor_1 = require("@/components/store/editor");
const models_1 = require("@onlook/models");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.OverlayOpenCode = (0, mobx_react_lite_1.observer)(({ isInputting }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const isDevMode = editorEngine.state.editorMode === models_1.EditorMode.CODE;
    const oid = editorEngine.elements.selected[0]?.oid;
    if (isDevMode || isInputting || !oid) {
        return null;
    }
    const handleCodeButtonClick = async () => {
        await editorEngine.ide.openCodeBlock(oid);
    };
    return (<div className={(0, utils_1.cn)('rounded-xl backdrop-blur-lg transition-all duration-300', 'shadow-xl shadow-background-secondary/50', 'bg-background-secondary/85 dark:bg-background/85 border-foreground-secondary/20 hover:border-foreground-secondary/50 p-0.5', 'border flex relative')}>
            <button onClick={handleCodeButtonClick} className="rounded-lg hover:text-foreground-primary transition-colors px-1.5 py-1.5 flex flex-row items-center gap-2 w-full" title="Open in Code">
                <icons_1.Icons.Code className="w-4 h-4"/>
            </button>
        </div>);
});
//# sourceMappingURL=code.js.map