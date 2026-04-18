"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeChangeDisplay = void 0;
const Context_1 = require("@/components/Context");
const ai_1 = require("@onlook/ai");
const react_1 = require("react");
const CollapsibleCodeBlock_1 = require("./CollapsibleCodeBlock");
const CodeChangeDisplay = ({ path, content, messageId, applied, isStream = false, }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const { search: searchContent, replace: replaceContent } = (0, react_1.useMemo)(() => ai_1.CodeBlockProcessor.parseDiff(content)[0] || { search: '', replace: '' }, [content]);
    const applyChange = () => {
        editorEngine.chat.code.applyCode(messageId);
    };
    const rejectChange = () => {
        editorEngine.chat.code.revertCode(messageId);
    };
    return (<div className="group relative">
            <CollapsibleCodeBlock_1.CollapsibleCodeBlock path={path} content={content} searchContent={searchContent} replaceContent={replaceContent} applied={applied} isStream={isStream} onApply={applyChange} onRevert={rejectChange}/>
        </div>);
};
exports.CodeChangeDisplay = CodeChangeDisplay;
exports.default = exports.CodeChangeDisplay;
//# sourceMappingURL=index.js.map