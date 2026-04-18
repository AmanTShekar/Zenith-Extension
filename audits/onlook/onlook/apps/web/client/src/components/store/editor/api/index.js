"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiManager = void 0;
const client_1 = require("@/trpc/client");
const mobx_1 = require("mobx");
class ApiManager {
    editorEngine;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    async webSearch(input) {
        const result = await client_1.api.utils.webSearch.mutate(input);
        return result;
    }
    async applyDiff(input) {
        return await client_1.api.utils.applyDiff.mutate(input);
    }
    async scrapeUrl(input) {
        return await client_1.api.utils.scrapeUrl.mutate(input);
    }
    async getConversationMessages(conversationId) {
        return await client_1.api.chat.message.getAll.query({ conversationId });
    }
}
exports.ApiManager = ApiManager;
//# sourceMappingURL=index.js.map