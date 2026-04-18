"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamMessage = void 0;
const message_content_1 = require("./message-content");
const StreamMessage = ({ message }) => {
    return (<div className="px-4 pt-2 text-small content-start flex flex-col text-wrap gap-2">
            <message_content_1.MessageContent messageId={message.id} parts={message.parts} applied={false} isStream={true}/>
        </div>);
};
exports.StreamMessage = StreamMessage;
//# sourceMappingURL=stream-message.js.map