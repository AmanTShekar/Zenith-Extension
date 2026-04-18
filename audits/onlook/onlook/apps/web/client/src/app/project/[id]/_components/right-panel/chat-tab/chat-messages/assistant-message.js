"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantMessage = void 0;
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const message_content_1 = require("./message-content");
const AssistantMessageComponent = ({ message, isStreaming }) => {
    return (<div className="px-4 py-2 text-small content-start flex flex-col text-wrap gap-2">
            <message_content_1.MessageContent messageId={message.id} parts={message.parts} applied={false} isStream={isStreaming}/>
        </div>);
};
exports.AssistantMessage = (0, react_1.memo)((0, mobx_react_lite_1.observer)(AssistantMessageComponent));
//# sourceMappingURL=assistant-message.js.map