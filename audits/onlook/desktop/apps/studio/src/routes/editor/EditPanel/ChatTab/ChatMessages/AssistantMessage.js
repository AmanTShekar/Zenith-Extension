"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantMessage = void 0;
const MessageContent_1 = require("./MessageContent");
const AssistantMessage = ({ message }) => {
    return (<div className="px-4 py-2 text-small content-start">
            <div className="flex flex-col text-wrap gap-2">
                <MessageContent_1.MessageContent messageId={message.id} content={message.content} applied={message.applied} isStream={false}/>
            </div>
        </div>);
};
exports.AssistantMessage = AssistantMessage;
//# sourceMappingURL=AssistantMessage.js.map