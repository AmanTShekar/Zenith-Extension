"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForChatMessages = listenForChatMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const chat_1 = __importDefault(require("../chat"));
const trainloop_1 = __importDefault(require("../chat/trainloop"));
const storage_1 = require("../storage");
function listenForChatMessages() {
    electron_1.ipcMain.handle(constants_1.MainChannels.SEND_CHAT_MESSAGES_STREAM, (e, args) => {
        const { messages, requestType } = args;
        return chat_1.default.stream(messages, requestType);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SEND_STOP_STREAM_REQUEST, (e, args) => {
        return chat_1.default.abortStream();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_CONVERSATIONS_BY_PROJECT, (e, args) => {
        const { projectId } = args;
        return storage_1.PersistentStorage.CONVERSATIONS.getCollection(projectId);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SAVE_CONVERSATION, (e, args) => {
        const { conversation } = args;
        return storage_1.PersistentStorage.CONVERSATIONS.writeItem(conversation);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.DELETE_CONVERSATION, (e, args) => {
        const { id } = args;
        return storage_1.PersistentStorage.CONVERSATIONS.deleteItem(id);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GENERATE_SUGGESTIONS, (e, args) => {
        const { messages } = args;
        return chat_1.default.generateSuggestions(messages);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_SUGGESTIONS_BY_PROJECT, (e, args) => {
        const { projectId } = args;
        const suggestions = storage_1.PersistentStorage.SUGGESTIONS.getCollection(projectId);
        return suggestions.flatMap((suggestion) => suggestion.suggestions);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SAVE_SUGGESTIONS, (e, args) => {
        const { suggestions } = args;
        return storage_1.PersistentStorage.SUGGESTIONS.writeItem(suggestions);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GENERATE_CHAT_SUMMARY, async (e, args) => {
        const { messages } = args;
        return chat_1.default.generateChatSummary(messages);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SAVE_APPLY_RESULT, (e, args) => {
        const { type, messages } = args;
        return trainloop_1.default.saveApplyResult(messages, type);
    });
}
//# sourceMappingURL=chat.js.map