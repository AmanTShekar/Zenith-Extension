"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationManager = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
const assistant_1 = require("../message/assistant");
const tool_1 = require("../message/tool");
const user_1 = require("../message/user");
const mockData_1 = require("../mockData");
const conversation_1 = require("./conversation");
const USE_MOCK = false;
class ConversationManager {
    editorEngine;
    projectsManager;
    projectId = null;
    current = null;
    conversations = [];
    constructor(editorEngine, projectsManager) {
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this);
        (0, mobx_1.reaction)(() => this.projectsManager.project, (current) => this.getCurrentProjectConversations(current));
    }
    async getCurrentProjectConversations(project) {
        this.editorEngine.chat.stream.dispose();
        if (!project) {
            return;
        }
        if (this.projectId === project.id) {
            return;
        }
        this.projectId = project.id;
        this.conversations = await this.getConversations(project.id);
        if (this.conversations.length === 0) {
            this.current = new conversation_1.ChatConversationImpl(project.id, []);
        }
        else {
            this.current = this.conversations[0];
        }
        if (USE_MOCK) {
            this.current = new conversation_1.ChatConversationImpl(project.id, mockData_1.MOCK_CHAT_MESSAGES);
        }
    }
    async getConversations(projectId) {
        const res = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_CONVERSATIONS_BY_PROJECT, { projectId });
        if (!res) {
            console.error('No conversations found');
            return [];
        }
        const conversations = res?.map((c) => conversation_1.ChatConversationImpl.fromJSON(c));
        const sorted = conversations.sort((a, b) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        return sorted || [];
    }
    startNewConversation() {
        if (!this.current) {
            console.error('No conversation found');
            return;
        }
        if (!this.projectId) {
            console.error('No project id found');
            return;
        }
        if (this.current.messages.length === 0 && !this.current.displayName) {
            console.error('Error starting new conversation. Current conversation is already empty.');
            return;
        }
        this.current = new conversation_1.ChatConversationImpl(this.projectId, []);
        this.conversations.push(this.current);
        this.editorEngine.chat.stream.dispose();
        (0, utils_1.sendAnalytics)('start new conversation');
    }
    selectConversation(id) {
        const match = this.conversations.find((c) => c.id === id);
        if (!match) {
            console.error('No conversation found with id', id);
            return;
        }
        this.current = match;
        this.editorEngine.chat.stream.dispose();
        (0, utils_1.sendAnalytics)('select conversation');
    }
    deleteConversation(id) {
        if (!this.current) {
            console.error('No conversation found');
            return;
        }
        if (!this.projectId) {
            console.error('No project id found');
            return;
        }
        const index = this.conversations.findIndex((c) => c.id === id);
        if (index === -1) {
            console.error('No conversation found with id', id);
            return;
        }
        this.conversations.splice(index, 1);
        this.deleteConversationInStorage(id);
        if (this.current.id === id) {
            if (this.conversations.length > 0) {
                this.current = this.conversations[0];
            }
            else {
                this.current = new conversation_1.ChatConversationImpl(this.projectId, []);
                this.conversations.push(this.current);
            }
        }
        this.editorEngine.chat.stream.dispose();
        (0, utils_1.sendAnalytics)('delete conversation');
    }
    deleteConversationInStorage(id) {
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.DELETE_CONVERSATION, { id });
    }
    saveConversationToStorage() {
        if (!this.current) {
            console.error('No conversation found');
            return;
        }
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SAVE_CONVERSATION, {
            conversation: this.current,
        });
    }
    async generateConversationSummary() {
        if (!this.current || !this.current.needsSummary()) {
            return;
        }
        const res = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GENERATE_CHAT_SUMMARY, {
            messages: this.current.getMessagesForStream(),
        });
        if (!res) {
            console.log(`Failed to generate summary for conversation`);
            return;
        }
        this.current.setSummaryMessage(res);
        this.saveConversationToStorage();
    }
    addUserMessage(stringContent, context) {
        if (!this.current) {
            console.error('No conversation found');
            return;
        }
        const newMessage = user_1.UserChatMessageImpl.fromStringContent(stringContent, context);
        this.current.appendMessage(newMessage);
        this.saveConversationToStorage();
        return newMessage;
    }
    addCoreUserMessage(coreMessage) {
        if (!this.current) {
            console.error('No conversation found');
            return;
        }
        const newMessage = user_1.UserChatMessageImpl.fromCoreMessage(coreMessage);
        this.current.appendMessage(newMessage);
        this.saveConversationToStorage();
        return newMessage;
    }
    addCoreAssistantMessage(coreMessage) {
        if (!this.current) {
            console.error('No conversation found');
            return;
        }
        const newMessage = assistant_1.AssistantChatMessageImpl.fromCoreMessage(coreMessage);
        this.current.appendMessage(newMessage);
        this.saveConversationToStorage();
        return newMessage;
    }
    addCoreToolMessage(coreMessage) {
        if (!this.current) {
            console.error('No conversation found');
            return;
        }
        const newMessage = tool_1.ToolChatMessageImpl.fromCoreMessage(coreMessage);
        this.current.appendMessage(newMessage);
        this.saveConversationToStorage();
        return newMessage;
    }
}
exports.ConversationManager = ConversationManager;
//# sourceMappingURL=index.js.map