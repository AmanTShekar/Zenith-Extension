"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageContent = void 0;
const mobx_react_lite_1 = require("mobx-react-lite");
const MarkdownRenderer_1 = __importDefault(require("../MarkdownRenderer"));
const ToolCallDisplay_1 = require("./ToolCallDisplay");
exports.MessageContent = (0, mobx_react_lite_1.observer)(({ messageId, content, applied, isStream, }) => {
    if (typeof content === 'string') {
        return (<MarkdownRenderer_1.default messageId={messageId} content={content} applied={applied} isStream={isStream}/>);
    }
    return content.map((part) => {
        if (part.type === 'text') {
            return (<MarkdownRenderer_1.default messageId={messageId} key={part.text} content={part.text} applied={applied} isStream={isStream}/>);
        }
        else if (part.type === 'tool-call') {
            return (<ToolCallDisplay_1.ToolCallDisplay key={part.toolCallId} toolCall={part} isStream={isStream}/>);
        }
        else if (part.type === 'reasoning') {
            return (<div key={part.text} className="border-2 border-green-500">
                        reasoning: {JSON.stringify(part, null, 2)}
                    </div>);
        }
    });
});
//# sourceMappingURL=index.js.map