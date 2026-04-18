"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageContent = void 0;
const ai_elements_1 = require("@onlook/ui/ai-elements");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const tool_call_display_1 = require("./tool-call-display");
const MessageContentComponent = ({ messageId, parts, applied, isStream, }) => {
    let lastIncompleteToolIndex = -1;
    if (isStream) {
        for (let i = parts.length - 1; i >= 0; i--) {
            const part = parts[i];
            if (part?.type.startsWith('tool-')) {
                const toolPart = part;
                if (toolPart.state !== 'output-available') {
                    lastIncompleteToolIndex = i;
                    break;
                }
            }
        }
    }
    const renderedParts = parts.map((part, idx) => {
        if (part?.type === 'text') {
            return (<ai_elements_1.Response key={part.text}>
                    {part.text}
                </ai_elements_1.Response>);
        }
        else if (part?.type.startsWith('tool-')) {
            const toolPart = part; // Only show loading animation for the last incomplete tool call
            const isLoadingThisTool = isStream && idx === lastIncompleteToolIndex;
            return (<tool_call_display_1.ToolCallDisplay messageId={messageId} toolPart={toolPart} key={toolPart.toolCallId} isStream={isLoadingThisTool} applied={applied}/>);
        }
        else if (part?.type === 'reasoning') {
            const isLastPart = idx === parts.length - 1;
            return (<ai_elements_1.Reasoning key={part.text} className={(0, utils_1.cn)("m-0 items-center gap-2 text-foreground-tertiary", isStream && isLastPart && "bg-gradient-to-l from-white/20 via-white/90 to-white/20 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer filter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]")} isStreaming={isStream}>
                    <ai_elements_1.ReasoningTrigger />
                    <ai_elements_1.ReasoningContent className="text-xs">{part.text}</ai_elements_1.ReasoningContent>
                </ai_elements_1.Reasoning>);
        }
    });
    return (<div className="select-text">
            {renderedParts}
        </div>);
};
exports.MessageContent = (0, mobx_react_lite_1.observer)(MessageContentComponent);
//# sourceMappingURL=index.js.map