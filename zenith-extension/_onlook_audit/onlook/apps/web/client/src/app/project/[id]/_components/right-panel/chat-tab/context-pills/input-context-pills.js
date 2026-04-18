"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputContextPills = void 0;
const editor_1 = require("@/components/store/editor");
const chat_1 = require("@onlook/models/chat");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const draft_context_pill_1 = require("./draft-context-pill");
const image_pill_1 = require("./image-pill");
const typeOrder = {
    [chat_1.MessageContextType.BRANCH]: 0,
    [chat_1.MessageContextType.FILE]: 1,
    [chat_1.MessageContextType.HIGHLIGHT]: 2,
    [chat_1.MessageContextType.ERROR]: 3,
    [chat_1.MessageContextType.AGENT_RULE]: 4,
    [chat_1.MessageContextType.IMAGE]: 5,
};
const getStableKey = (context, index) => {
    switch (context.type) {
        case chat_1.MessageContextType.FILE:
            return `file-${context.path}-${context.branchId}`;
        case chat_1.MessageContextType.HIGHLIGHT:
            return `highlight-${context.path}-${context.start}-${context.end}-${context.branchId}`;
        case chat_1.MessageContextType.IMAGE:
            return `image-${context.id || index}`;
        case chat_1.MessageContextType.BRANCH:
            return `branch-${context.branch.id}`;
        case chat_1.MessageContextType.ERROR:
            return `error-${context.branchId}`;
        case chat_1.MessageContextType.AGENT_RULE:
            return `agent-rule-${context.path}`;
        default:
            (0, utility_1.assertNever)(context);
    }
};
exports.InputContextPills = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const handleRemoveContext = (contextToRemove) => {
        const newContext = [...editorEngine.chat.context.context].filter((context) => context !== contextToRemove);
        editorEngine.chat.context.context = newContext;
    };
    const sortedContexts = (0, react_2.useMemo)(() => {
        return [...editorEngine.chat.context.context]
            .sort((a, b) => {
            return typeOrder[a.type] - typeOrder[b.type];
        });
    }, [editorEngine.chat.context.context]);
    return (<div className="flex flex-row flex-wrap items-center gap-1.5 px-1 pt-1">
            <react_1.AnimatePresence mode="popLayout">
                {sortedContexts.map((context, index) => {
            const key = getStableKey(context, index);
            if (context.type === chat_1.MessageContextType.IMAGE) {
                return (<image_pill_1.ImagePill key={key} context={context} onRemove={() => handleRemoveContext(context)}/>);
            }
            return (<draft_context_pill_1.DraftContextPill key={key} context={context} onRemove={() => handleRemoveContext(context)}/>);
        })}
            </react_1.AnimatePresence>
        </div>);
});
//# sourceMappingURL=input-context-pills.js.map