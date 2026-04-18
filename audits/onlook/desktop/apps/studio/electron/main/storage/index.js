"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentStorage = exports.StorageType = void 0;
const directory_1 = require("./directory");
const file_1 = require("./file");
var StorageType;
(function (StorageType) {
    StorageType["USER_SETTINGS"] = "user-settings";
    StorageType["APP_STATE"] = "app-state";
    StorageType["USER_METADATA"] = "user-metadata";
    StorageType["AUTH_TOKENS"] = "auth-tokens-v1";
    StorageType["PROJECTS"] = "projects";
    StorageType["CONVERSATIONS"] = "conversations-v1";
    StorageType["SUGGESTIONS"] = "suggestions";
})(StorageType || (exports.StorageType = StorageType = {}));
class PersistentStorage {
    static APP_STATE = new file_1.SingleFilePersistentStorage(StorageType.APP_STATE);
    static PROJECTS = new file_1.SingleFilePersistentStorage(StorageType.PROJECTS);
    static USER_SETTINGS = new file_1.SingleFilePersistentStorage(StorageType.USER_SETTINGS);
    static USER_METADATA = new file_1.SingleFilePersistentStorage(StorageType.USER_METADATA);
    static AUTH_TOKENS = new file_1.SingleFilePersistentStorage(StorageType.AUTH_TOKENS);
    static CONVERSATIONS = new directory_1.DirectoryPersistentStorage(StorageType.CONVERSATIONS, false, (conversation) => conversation.projectId);
    static SUGGESTIONS = new directory_1.DirectoryPersistentStorage(StorageType.SUGGESTIONS, false, (suggestion) => suggestion.projectId);
}
exports.PersistentStorage = PersistentStorage;
//# sourceMappingURL=index.js.map