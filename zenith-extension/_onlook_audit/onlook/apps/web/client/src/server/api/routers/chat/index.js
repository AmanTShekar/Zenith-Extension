"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const trpc_1 = require("../../trpc");
const conversation_1 = require("./conversation");
const message_1 = require("./message");
const suggestion_1 = require("./suggestion");
exports.chatRouter = (0, trpc_1.createTRPCRouter)({
    conversation: conversation_1.conversationRouter,
    message: message_1.messageRouter,
    suggestions: suggestion_1.suggestionsRouter,
});
//# sourceMappingURL=index.js.map