"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatManager = exports.FOCUS_CHAT_INPUT_EVENT = void 0;
const mobx_1 = require("mobx");
const context_1 = require("./context");
const conversation_1 = require("./conversation");
exports.FOCUS_CHAT_INPUT_EVENT = 'focus-chat-input';
class ChatManager {
    editorEngine;
    conversation;
    context;
    // Content sent from useChat hook
    _sendMessageAction = null;
    isStreaming = false;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        this.context = new context_1.ChatContext(this.editorEngine);
        this.conversation = new conversation_1.ConversationManager(this.editorEngine);
        (0, mobx_1.makeAutoObservable)(this);
    }
    init() {
        this.context.init();
    }
    focusChatInput() {
        window.dispatchEvent(new Event(exports.FOCUS_CHAT_INPUT_EVENT));
    }
    getCurrentConversationId() {
        return this.conversation.current?.id;
    }
    setIsStreaming(isStreaming) {
        this.isStreaming = isStreaming;
    }
    setChatActions(sendMessage) {
        this._sendMessageAction = sendMessage;
    }
    async sendMessage(content, type) {
        if (!this._sendMessageAction) {
            throw new Error('Chat actions not initialized');
        }
        await this._sendMessageAction(content, type);
    }
    clear() {
        this.context.clear();
        this.conversation.clear();
    }
}
exports.ChatManager = ChatManager;
//# sourceMappingURL=index.js.map