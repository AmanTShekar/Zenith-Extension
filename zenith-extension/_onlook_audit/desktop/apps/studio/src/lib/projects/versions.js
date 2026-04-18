"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionsManager = exports.CreateCommitFailureReason = void 0;
const constants_1 = require("@onlook/models/constants");
const use_toast_1 = require("@onlook/ui/use-toast");
const mobx_1 = require("mobx");
const utils_1 = require("../utils");
var CreateCommitFailureReason;
(function (CreateCommitFailureReason) {
    CreateCommitFailureReason["NOT_INITIALIZED"] = "NOT_INITIALIZED";
    CreateCommitFailureReason["COMMIT_EMPTY"] = "COMMIT_EMPTY";
    CreateCommitFailureReason["FAILED_TO_SAVE"] = "FAILED_TO_SAVE";
    CreateCommitFailureReason["COMMIT_IN_PROGRESS"] = "COMMIT_IN_PROGRESS";
})(CreateCommitFailureReason || (exports.CreateCommitFailureReason = CreateCommitFailureReason = {}));
class VersionsManager {
    project;
    editorEngine;
    commits = null;
    savedCommits = [];
    isSaving = false;
    constructor(project, editorEngine) {
        this.project = project;
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    initializeRepo = async () => {
        const isInitialized = await (0, utils_1.invokeMainChannel)(constants_1.GitChannels.IS_REPO_INITIALIZED, {
            repoPath: this.project.folderPath,
        });
        if (!isInitialized) {
            await (0, utils_1.invokeMainChannel)(constants_1.GitChannels.INIT_REPO, { repoPath: this.project.folderPath });
            await this.createCommit('Initial commit');
        }
        await this.listCommits();
    };
    get latestCommit() {
        if (!this.commits || this.commits.length === 0) {
            return undefined;
        }
        return this.commits[0];
    }
    createCommit = async (message = 'New Onlook backup', showToast = true) => {
        try {
            if (this.isSaving) {
                if (showToast) {
                    (0, use_toast_1.toast)({
                        title: 'Backup already in progress',
                    });
                }
                return {
                    success: false,
                    errorReason: CreateCommitFailureReason.COMMIT_IN_PROGRESS,
                };
            }
            this.isSaving = true;
            (0, utils_1.sendAnalytics)('versions create commit', {
                message,
            });
            const isInitialized = await (0, utils_1.invokeMainChannel)(constants_1.GitChannels.IS_REPO_INITIALIZED, {
                repoPath: this.project.folderPath,
            });
            if (!isInitialized) {
                await (0, utils_1.invokeMainChannel)(constants_1.GitChannels.INIT_REPO, {
                    repoPath: this.project.folderPath,
                });
            }
            const isEmpty = await (0, utils_1.invokeMainChannel)(constants_1.GitChannels.IS_EMPTY_COMMIT, {
                repoPath: this.project.folderPath,
            });
            if (!isEmpty) {
                await (0, utils_1.invokeMainChannel)(constants_1.GitChannels.ADD_ALL, { repoPath: this.project.folderPath });
                const commitResult = await (0, utils_1.invokeMainChannel)(constants_1.GitChannels.COMMIT, {
                    repoPath: this.project.folderPath,
                    message,
                });
                if (!commitResult) {
                    (0, utils_1.sendAnalytics)('versions create commit failed', {
                        message,
                        errorReason: CreateCommitFailureReason.FAILED_TO_SAVE,
                    });
                    return {
                        success: false,
                        errorReason: CreateCommitFailureReason.FAILED_TO_SAVE,
                    };
                }
                if (showToast) {
                    (0, use_toast_1.toast)({
                        title: 'Backup created!',
                        description: 'You can now restore to this version',
                    });
                }
                await this.listCommits();
                (0, utils_1.sendAnalytics)('versions create commit success', {
                    message,
                });
                return {
                    success: true,
                };
            }
            else {
                if (showToast) {
                    (0, use_toast_1.toast)({
                        title: 'No changes to commit',
                    });
                }
                (0, utils_1.sendAnalytics)('versions create commit failed', {
                    message,
                    errorReason: CreateCommitFailureReason.COMMIT_EMPTY,
                });
                return {
                    success: false,
                    errorReason: CreateCommitFailureReason.COMMIT_EMPTY,
                };
            }
        }
        catch (error) {
            this.isSaving = false;
            console.error('Failed to create commit', error);
            return {
                success: false,
                errorReason: CreateCommitFailureReason.FAILED_TO_SAVE,
            };
        }
        finally {
            this.isSaving = false;
        }
    };
    listCommits = async () => {
        const commits = await (0, utils_1.invokeMainChannel)(constants_1.GitChannels.LIST_COMMITS, {
            repoPath: this.project.folderPath,
        });
        if (!commits) {
            return (this.commits = []);
        }
        this.commits = commits;
    };
    checkoutCommit = async (commit) => {
        (0, utils_1.sendAnalytics)('versions checkout commit', {
            commit: commit.displayName || commit.message,
        });
        const res = await this.createCommit('Save before restoring backup', false);
        // If failed to create commit, don't continue backing up
        // If the commit was empty, this is ok
        if (!res?.success && res?.errorReason !== CreateCommitFailureReason.COMMIT_EMPTY) {
            (0, utils_1.sendAnalytics)('versions checkout commit failed', {
                commit: commit.displayName || commit.message,
                errorReason: res?.errorReason,
            });
            return false;
        }
        await (0, utils_1.invokeMainChannel)(constants_1.GitChannels.CHECKOUT, {
            repoPath: this.project.folderPath,
            commit: commit.oid,
        });
        (0, use_toast_1.toast)({
            title: 'Restored to backup!',
            description: `Your project has been restored to version "${commit.displayName || commit.message}"`,
        });
        await this.listCommits();
        // Add a 1-second delay before refreshing webviews
        if (this.editorEngine) {
            setTimeout(() => {
                this.editorEngine?.webviews.reloadWebviews();
            }, 1000);
        }
        (0, utils_1.sendAnalytics)('versions checkout commit success', {
            commit: commit.displayName || commit.message,
        });
        return true;
    };
    renameCommit = async (commit, newName) => {
        await (0, utils_1.invokeMainChannel)(constants_1.GitChannels.RENAME_COMMIT, {
            repoPath: this.project.folderPath,
            commit,
            newName,
        });
        await this.listCommits();
        (0, utils_1.sendAnalytics)('versions rename commit', {
            commit: commit,
            newName,
        });
    };
    saveCommit = async (commit) => {
        if (this.savedCommits.some((c) => c.oid === commit.oid)) {
            (0, use_toast_1.toast)({
                title: 'Backup already saved',
            });
            return;
        }
        this.savedCommits?.push(commit);
        (0, use_toast_1.toast)({
            title: 'Backup bookmarked!',
            description: 'You can now quickly restore to this version',
        });
        (0, utils_1.sendAnalytics)('versions save commit', {
            commit: commit.displayName || commit.message,
        });
    };
    removeSavedCommit = async (commit) => {
        this.savedCommits = this.savedCommits.filter((c) => c.oid !== commit.oid);
        (0, utils_1.sendAnalytics)('versions remove saved commit', {
            commit: commit.displayName || commit.message,
        });
    };
    saveLatestCommit = async () => {
        if (!this.commits || this.commits.length === 0) {
            (0, use_toast_1.toast)({
                title: 'No backups found',
                description: 'Please create a backup first',
            });
            return;
        }
        const latestCommit = this.commits[0];
        await this.saveCommit(latestCommit);
        (0, use_toast_1.toast)({
            title: 'Latest backup bookmarked!',
            description: 'You can now quickly restore to this version',
        });
    };
    updateProject(project) {
        this.project = project;
    }
    dispose() { }
}
exports.VersionsManager = VersionsManager;
//# sourceMappingURL=versions.js.map