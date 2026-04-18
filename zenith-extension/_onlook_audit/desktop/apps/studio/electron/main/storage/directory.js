"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryPersistentStorage = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const base_1 = require("./base");
class DirectoryPersistentStorage extends base_1.BasePersistentStorage {
    getCollectionKey;
    DIR_PATH;
    INDEX_PATH;
    constructor(fileName, encrypted = false, getCollectionKey) {
        super(fileName, encrypted);
        this.getCollectionKey = getCollectionKey;
        this.DIR_PATH = path_1.default.join(this.APP_PATH, fileName);
        this.INDEX_PATH = path_1.default.join(this.DIR_PATH, 'index.json');
        if (!(0, fs_1.existsSync)(this.DIR_PATH)) {
            (0, fs_1.mkdirSync)(this.DIR_PATH, { recursive: true });
        }
    }
    readItem(id) {
        try {
            const filePath = this.getItemPath(id);
            if (!(0, fs_1.existsSync)(filePath)) {
                return null;
            }
            const data = (0, fs_1.readFileSync)(filePath, 'utf8');
            return this.encrypted ? this.readEncryptedData(data) : this.readUnencryptedData(data);
        }
        catch (e) {
            console.error(`Error reading item ${id}: `, e);
            return null;
        }
    }
    writeItem(item) {
        try {
            const filePath = this.getItemPath(item.id);
            const data = this.encrypted
                ? this.writeEncryptedData(item)
                : this.writeUnencryptedData(item);
            (0, fs_1.writeFileSync)(filePath, data);
            if (this.getCollectionKey) {
                this.updateIndex(item);
            }
        }
        catch (e) {
            console.error(`Error writing item ${item.id}: `, e);
        }
    }
    deleteItem(id, collectionKey) {
        try {
            const filePath = this.getItemPath(id);
            if ((0, fs_1.existsSync)(filePath)) {
                (0, fs_1.unlinkSync)(filePath);
                if (collectionKey) {
                    this.removeFromIndex(id, collectionKey);
                }
            }
        }
        catch (e) {
            console.error(`Error deleting item ${id}: `, e);
        }
    }
    getCollection(collectionKey) {
        const index = this.readIndex();
        const itemIds = index.collections[collectionKey] || [];
        return itemIds.map((id) => this.readItem(id)).filter((item) => item !== null);
    }
    getAllItems() {
        try {
            const files = (0, fs_1.readdirSync)(this.DIR_PATH).filter((file) => file.endsWith('.json') && file !== 'index.json');
            return files
                .map((file) => {
                const id = path_1.default.parse(file).name;
                return this.readItem(id);
            })
                .filter((item) => item !== null);
        }
        catch (e) {
            console.error('Error reading all items: ', e);
            return [];
        }
    }
    getItemPath(id) {
        return path_1.default.join(this.DIR_PATH, `${id}.json`);
    }
    readIndex() {
        if (!(0, fs_1.existsSync)(this.INDEX_PATH)) {
            return { collections: {} };
        }
        try {
            const data = (0, fs_1.readFileSync)(this.INDEX_PATH, 'utf8');
            return JSON.parse(data);
        }
        catch (e) {
            console.error('Error reading index: ', e);
            return { collections: {} };
        }
    }
    writeIndex(index) {
        (0, fs_1.writeFileSync)(this.INDEX_PATH, JSON.stringify(index));
    }
    updateIndex(item) {
        if (!this.getCollectionKey) {
            return;
        }
        const collectionKey = this.getCollectionKey(item);
        const index = this.readIndex();
        if (!index.collections[collectionKey]) {
            index.collections[collectionKey] = [];
        }
        if (!index.collections[collectionKey].includes(item.id)) {
            index.collections[collectionKey].push(item.id);
            this.writeIndex(index);
        }
    }
    removeFromIndex(id, collectionKey) {
        const index = this.readIndex();
        if (index.collections[collectionKey]) {
            index.collections[collectionKey] = index.collections[collectionKey].filter((itemId) => itemId !== id);
            if (index.collections[collectionKey].length === 0) {
                delete index.collections[collectionKey];
            }
            this.writeIndex(index);
        }
    }
}
exports.DirectoryPersistentStorage = DirectoryPersistentStorage;
//# sourceMappingURL=directory.js.map