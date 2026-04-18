"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatTab = void 0;
const ChatInput_1 = require("./ChatInput");
const ChatMessages_1 = require("./ChatMessages");
const ErrorView_1 = require("./ErrorView");
const ChatTab = () => {
    return (<div className="w-full h-[calc(100vh-8.25rem)] flex flex-col justify-end gap-2">
            <ChatMessages_1.ChatMessages />
            <ErrorView_1.ErrorView />
            <ChatInput_1.ChatInput />
        </div>);
};
exports.ChatTab = ChatTab;
//# sourceMappingURL=index.js.map