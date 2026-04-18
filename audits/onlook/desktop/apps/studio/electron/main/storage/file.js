"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleFilePersistentStorage = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const base_1 = require("./base");
class SingleFilePersistentStorage extends base_1.BasePersistentStorage {
    FILE_PATH;
    constructor(fileName, encrypted = false) {
        super(fileName, encrypted);
        this.FILE_PATH = path_1.default.join(this.APP_PATH, `${fileName}.json`);
    }
    read() {
        try {
            if (!(0, fs_1.existsSync)(this.FILE_PATH)) {
                return null;
            }
            const data = (0, fs_1.readFileSync)(this.FILE_PATH, 'utf8');
            return this.encrypted ? this.readEncryptedData(data) : this.readUnencryptedData(data);
        }
        catch (e) {
            console.error(`Error reading file ${this.FILE_PATH}: `, e);
            return null;
        }
    }
    replace(value) {
        try {
            const data = this.encrypted
                ? this.writeEncryptedData(value)
                : this.writeUnencryptedData(value);
            (0, fs_1.writeFileSync)(this.FILE_PATH, data);
        }
        catch (e) {
            console.error(`Error writing file ${this.FILE_PATH}: `, e);
        }
    }
    update(partialValue) {
        try {
            const existingValue = this.read();
            this.replace({ ...(existingValue ?? {}), ...partialValue });
        }
        catch (e) {
            console.error(`Error updating file ${this.FILE_PATH}: `, e);
        }
    }
    clear() {
        try {
            (0, fs_1.writeFileSync)(this.FILE_PATH, '');
        }
        catch (e) {
            console.error(`Error clearing file ${this.FILE_PATH}: `, e);
        }
    }
}
exports.SingleFilePersistentStorage = SingleFilePersistentStorage;
//# sourceMappingURL=file.js.map