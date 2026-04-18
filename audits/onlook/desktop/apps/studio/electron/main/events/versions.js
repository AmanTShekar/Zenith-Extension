"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForVersionsMessages = listenForVersionsMessages;
const git_1 = require("@onlook/git");
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
function listenForVersionsMessages() {
    electron_1.ipcMain.handle(constants_1.GitChannels.IS_REPO_INITIALIZED, (_, { repoPath }) => {
        return (0, git_1.isRepoInitialized)(repoPath);
    });
    electron_1.ipcMain.handle(constants_1.GitChannels.INIT_REPO, (_, { repoPath }) => {
        return (0, git_1.init)(repoPath);
    });
    electron_1.ipcMain.handle(constants_1.GitChannels.IS_EMPTY_COMMIT, (_, { repoPath }) => {
        return (0, git_1.isEmptyCommit)(repoPath);
    });
    electron_1.ipcMain.handle(constants_1.GitChannels.ADD, (_, { repoPath, filepath }) => {
        return (0, git_1.add)(repoPath, filepath);
    });
    electron_1.ipcMain.handle(constants_1.GitChannels.ADD_ALL, (_, { repoPath }) => {
        return (0, git_1.addAll)(repoPath);
    });
    electron_1.ipcMain.handle(constants_1.GitChannels.COMMIT, (_, { repoPath, message }) => {
        return (0, git_1.commit)(repoPath, message);
    });
    electron_1.ipcMain.handle(constants_1.GitChannels.LIST_COMMITS, (_, { repoPath }) => {
        return (0, git_1.getCommits)(repoPath);
    });
    electron_1.ipcMain.handle(constants_1.GitChannels.STATUS, (_, { repoPath }) => {
        return (0, git_1.status)(repoPath);
    });
    electron_1.ipcMain.handle(constants_1.GitChannels.CHECKOUT, async (_, { repoPath, commit }) => {
        return (0, git_1.checkout)(repoPath, commit);
    });
    electron_1.ipcMain.handle(constants_1.GitChannels.GET_CURRENT_COMMIT, (_, { repoPath }) => {
        return (0, git_1.getCurrentCommit)(repoPath);
    });
    electron_1.ipcMain.handle(constants_1.GitChannels.RENAME_COMMIT, (_, { repoPath, commit, newName }) => {
        return (0, git_1.updateCommitDisplayName)(repoPath, commit, newName);
    });
}
//# sourceMappingURL=versions.js.map