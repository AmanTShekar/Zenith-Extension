"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultCreateProjectPath = getDefaultCreateProjectPath;
exports.getCreateProjectPath = getCreateProjectPath;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const storage_1 = require("../storage");
function getDefaultCreateProjectPath() {
    const documentsPath = electron_1.app.getPath('documents');
    const projectsPath = path_1.default.join(documentsPath, 'Onlook', 'Projects');
    return projectsPath;
}
function getCreateProjectPath() {
    const userSettings = storage_1.PersistentStorage.USER_SETTINGS.read();
    return userSettings?.editor?.newProjectPath || getDefaultCreateProjectPath();
}
//# sourceMappingURL=helpers.js.map