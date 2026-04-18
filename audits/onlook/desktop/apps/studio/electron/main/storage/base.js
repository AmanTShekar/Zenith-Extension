"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePersistentStorage = void 0;
const electron_1 = require("electron");
class BasePersistentStorage {
    fileName;
    encrypted;
    APP_PATH;
    constructor(fileName, encrypted = false) {
        this.fileName = fileName;
        this.encrypted = encrypted;
        this.APP_PATH = electron_1.app.getPath('userData');
    }
    readEncryptedData(data) {
        const encryptedBuffer = Buffer.from(data, 'base64');
        const decryptedData = electron_1.safeStorage.decryptString(encryptedBuffer);
        return decryptedData ? JSON.parse(decryptedData) : null;
    }
    writeEncryptedData(value) {
        const data = JSON.stringify(value);
        const encryptedData = electron_1.safeStorage.encryptString(data);
        return encryptedData.toString('base64');
    }
    readUnencryptedData(data) {
        return data ? JSON.parse(data) : null;
    }
    writeUnencryptedData(value) {
        return JSON.stringify(value);
    }
}
exports.BasePersistentStorage = BasePersistentStorage;
//# sourceMappingURL=base.js.map