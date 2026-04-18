"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRepoInitialized = isRepoInitialized;
exports.init = init;
exports.add = add;
exports.isEmptyCommit = isEmptyCommit;
exports.addAll = addAll;
exports.status = status;
exports.commit = commit;
exports.checkout = checkout;
exports.branch = branch;
exports.log = log;
exports.getCommits = getCommits;
exports.getCurrentCommit = getCurrentCommit;
exports.getCurrentBranch = getCurrentBranch;
exports.updateCommitDisplayName = updateCommitDisplayName;
exports.getCommitDisplayName = getCommitDisplayName;
const fs_1 = __importDefault(require("fs"));
const isomorphic_git_1 = require("isomorphic-git");
const path_1 = __importDefault(require("path"));
const GIT_AUTHOR = { name: 'Onlook', email: 'git@onlook.com' };
const DISPLAY_NAME_NAMESPACE = 'onlook-display-name';
async function isRepoInitialized(dir) {
    try {
        // Check if .git directory exists
        const exists = fs_1.default.existsSync(path_1.default.join(dir, '.git'));
        return exists;
    }
    catch (error) {
        console.error('Error checking if repository is initialized:', error);
        return false;
    }
}
async function init(repoPath) {
    await (0, isomorphic_git_1.init)({ fs: fs_1.default, dir: repoPath, defaultBranch: 'main' });
}
async function add(repoPath, filepath) {
    await (0, isomorphic_git_1.add)({ fs: fs_1.default, dir: repoPath, filepath });
}
async function isEmptyCommit(repoPath) {
    try {
        const changes = (await (0, isomorphic_git_1.statusMatrix)({
            fs: fs_1.default,
            dir: repoPath,
        })).filter(([_, HEAD, WORKDIR, STAGE]) => 
        // filter unchanged
        // https://github.com/isomorphic-git/isomorphic-git/issues/865#issuecomment-533028127
        // https://isomorphic-git.org/docs/en/statusMatrix.html
        !(HEAD == 1 && WORKDIR == 1 && STAGE == 1));
        return changes.length === 0;
    }
    catch (error) {
        console.error('Error checking if commit is empty:', error);
        return false;
    }
}
async function addAll(repoPath) {
    const status = await (0, isomorphic_git_1.statusMatrix)({ fs: fs_1.default, dir: repoPath });
    await Promise.all(status.map(async ([filepath, HEAD, worktreeStatus]) => {
        try {
            // If file exists in worktree (worktreeStatus === 1), add it
            // If file doesn't exist in worktree (worktreeStatus === 0) but exists in HEAD (HEAD === 1), remove it
            if (worktreeStatus) {
                return (0, isomorphic_git_1.add)({ fs: fs_1.default, dir: repoPath, filepath });
            }
            else if (HEAD) {
                return (0, isomorphic_git_1.remove)({ fs: fs_1.default, dir: repoPath, filepath });
            }
        }
        catch (error) {
            console.error(`Error processing file ${filepath}:`, error);
        }
    }));
}
async function status(repoPath, filepath = '.') {
    return await (0, isomorphic_git_1.status)({ fs: fs_1.default, dir: repoPath, filepath });
}
async function commit(repoPath, message, author = GIT_AUTHOR) {
    return await (0, isomorphic_git_1.commit)({
        fs: fs_1.default,
        dir: repoPath,
        message,
        author,
    });
}
async function checkout(repoPath, commitHash) {
    await (0, isomorphic_git_1.checkout)({
        fs: fs_1.default,
        dir: repoPath,
        ref: commitHash,
        noUpdateHead: true,
        force: true,
    });
}
async function branch(repoPath, branchName) {
    await (0, isomorphic_git_1.branch)({
        fs: fs_1.default,
        dir: repoPath,
        ref: branchName,
        checkout: true,
    });
}
async function log(repoPath) {
    return await (0, isomorphic_git_1.log)({ fs: fs_1.default, dir: repoPath });
}
async function getCommits(repoPath) {
    const commits = await (0, isomorphic_git_1.log)({ fs: fs_1.default, dir: repoPath });
    return Promise.all(commits.map(async (commit) => ({
        oid: commit.oid,
        message: commit.commit.message,
        author: commit.commit.author,
        timestamp: commit.commit.author.timestamp,
        displayName: await getCommitDisplayName(repoPath, commit.oid),
    })));
}
async function getCurrentCommit(repoPath) {
    const currentBranchName = await (0, isomorphic_git_1.currentBranch)({ fs: fs_1.default, dir: repoPath });
    if (!currentBranchName) {
        throw new Error('Not on any branch');
    }
    const commit = await (0, isomorphic_git_1.resolveRef)({ fs: fs_1.default, dir: repoPath, ref: currentBranchName });
    return commit;
}
async function getCurrentBranch(repoPath) {
    const branch = await (0, isomorphic_git_1.currentBranch)({ fs: fs_1.default, dir: repoPath });
    if (!branch) {
        return null;
    }
    return branch;
}
async function updateCommitDisplayName(repoPath, oid, newName) {
    await (0, isomorphic_git_1.addNote)({
        fs: fs_1.default,
        dir: repoPath,
        oid: oid,
        note: newName,
        ref: `refs/notes/${DISPLAY_NAME_NAMESPACE}`,
        force: true,
        author: GIT_AUTHOR,
    });
}
async function getCommitDisplayName(repoPath, oid) {
    try {
        const note = await (0, isomorphic_git_1.readNote)({
            fs: fs_1.default,
            dir: repoPath,
            oid: oid,
            ref: `refs/notes/${DISPLAY_NAME_NAMESPACE}`,
        });
        return Buffer.from(note).toString('utf8');
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=git.js.map