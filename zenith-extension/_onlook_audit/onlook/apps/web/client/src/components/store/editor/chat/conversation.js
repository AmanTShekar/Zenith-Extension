"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationManager = void 0;
const client_1 = require("@/trpc/client");
const mobx_1 = require("mobx");
const sonner_1 = require("sonner");
class ConversationManager {
    editorEngine;
    current = null;
    conversations = [];
    creatingConversation = false;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    async applyConversations(conversations) {
        this.conversations = conversations;
        if (conversations.length > 0 && conversations[0]) {
            const conversation = conversations[0];
            await this.selectConversation(conversation.id);
        }
        else {
            await this.startNewConversation();
        }
    }
    async getConversations(projectId) {
        const res = await this.getConversationsFromStorage(projectId);
        if (!res) {
            console.error('No conversations found');
            return [];
        }
        const conversations = res;
        const sorted = conversations.sort((a, b) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        return sorted || [];
    }
    setConversationLength(length) {
        if (this.current) {
            this.current = {
                ...this.current,
                messageCount: length,
            };
        }
    }
    async startNewConversation() {
        try {
            this.creatingConversation = true;
            if (this.current?.messageCount === 0 && !this.current?.title) {
                throw new Error('Current conversation is already empty.');
            }
            const newConversation = await client_1.api.chat.conversation.upsert.mutate({
                projectId: this.editorEngine.projectId,
            });
            this.current = {
                ...newConversation,
                messageCount: 0,
            };
            this.conversations.push(newConversation);
        }
        catch (error) {
            console.error('Error starting new conversation', error);
            sonner_1.toast.error('Error starting new conversation.', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        }
        finally {
            this.creatingConversation = false;
        }
    }
    async selectConversation(id) {
        const match = this.conversations.find((c) => c.id === id);
        if (!match) {
            console.error('No conversation found with id', id);
            return;
        }
        this.current = {
            ...match,
            messageCount: 0,
        };
    }
    deleteConversation(id) {
        if (!this.current) {
            console.error('No conversation found');
            return;
        }
        const index = this.conversations.findIndex((c) => c.id === id);
        if (index === -1) {
            console.error('No conversation found with id', id);
            return;
        }
        this.conversations.splice(index, 1);
        void this.deleteConversationInStorage(id);
        if (this.current?.id === id) {
            if (this.conversations.length > 0 && !!this.conversations[0]) {
                void this.selectConversation(this.conversations[0].id);
            }
            else {
                void this.startNewConversation();
            }
        }
    }
    async generateTitle(content) {
        if (!this.current) {
            console.error('No conversation found');
            return;
        }
        const title = await client_1.api.chat.conversation.generateTitle.mutate({
            conversationId: this.current?.id,
            content,
        });
        if (!title) {
            console.error('Error generating conversation title. No title returned.');
            return;
        }
        // Update local active conversation 
        this.current = {
            ...this.current,
            title,
        };
        // Update in local conversations list
        const index = this.conversations.findIndex((c) => c.id === this.current?.id);
        if (index !== -1 && this.conversations[index]) {
            this.conversations[index] = {
                ...this.conversations[index],
                title,
            };
        }
    }
    async getConversationsFromStorage(id) {
        return client_1.api.chat.conversation.getAll.query({ projectId: id });
    }
    async upsertConversationInStorage(conversation) {
        return await client_1.api.chat.conversation.upsert.mutate({
            ...conversation,
            projectId: this.editorEngine.projectId,
        });
    }
    async updateConversationInStorage(conversation) {
        await client_1.api.chat.conversation.update.mutate(conversation);
    }
    async deleteConversationInStorage(id) {
        await client_1.api.chat.conversation.delete.mutate({ conversationId: id });
    }
    clear() {
        this.current = null;
        this.conversations = [];
    }
}
exports.ConversationManager = ConversationManager;
//# sourceMappingURL=conversation.js.map