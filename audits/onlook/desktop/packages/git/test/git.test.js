"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const git_1 = require("../src/git");
(0, bun_test_1.describe)('GitManager Integration Tests', () => {
    let testRepoPath;
    (0, bun_test_1.beforeEach)(async () => {
        // Create a temporary directory for testing with a shorter path
        testRepoPath = 'git-test-' + Date.now();
        fs_1.default.mkdirSync(testRepoPath, { recursive: true });
        // Create package.json (required by isomorphic-git)
        fs_1.default.writeFileSync(path_1.default.join(testRepoPath, 'package.json'), JSON.stringify({ name: 'test-repo', version: '1.0.0' }));
        // Initialize Git repository
        await (0, git_1.init)(testRepoPath);
        // Create some test files
        fs_1.default.writeFileSync(path_1.default.join(testRepoPath, 'test1.txt'), 'Hello World');
        fs_1.default.writeFileSync(path_1.default.join(testRepoPath, 'test2.txt'), 'Another test file');
    });
    (0, bun_test_1.afterEach)(() => {
        // Clean up the test directory
        fs_1.default.rmSync(testRepoPath, { recursive: true, force: true });
    });
    (0, bun_test_1.test)('should initialize Git repository', async () => {
        (0, bun_test_1.expect)(fs_1.default.existsSync(path_1.default.join(testRepoPath, '.git'))).toBe(true);
    });
    (0, bun_test_1.test)('should correctly detect if repository is initialized', async () => {
        // Test initialized repo
        (0, bun_test_1.expect)(await (0, git_1.isRepoInitialized)(testRepoPath)).toBe(true);
        // Delete the .git directory
        fs_1.default.rmSync(path_1.default.join(testRepoPath, '.git'), { recursive: true, force: true });
        // Test non-initialized repo
        (0, bun_test_1.expect)(await (0, git_1.isRepoInitialized)(testRepoPath)).toBe(false);
    });
    (0, bun_test_1.test)('should add files', async () => {
        await (0, git_1.add)(testRepoPath, 'test1.txt');
        // Verify file was added by committing and checking if it appears in the commit
        await (0, git_1.commit)(testRepoPath, 'Add test1.txt');
        const commits = await (0, git_1.log)(testRepoPath);
        (0, bun_test_1.expect)(commits).toHaveLength(1);
    });
    (0, bun_test_1.test)('should add files', async () => {
        const res = await (0, git_1.status)(testRepoPath, 'test1.txt');
        (0, bun_test_1.expect)(res).toBe('*added');
        await (0, git_1.add)(testRepoPath, 'test1.txt');
        // Verify file was added by committing and checking if it appears in the commit
        const res1 = await (0, git_1.status)(testRepoPath, 'test1.txt');
        (0, bun_test_1.expect)(res1).toBe('added');
    });
    (0, bun_test_1.test)('should add and commit files', async () => {
        // Add all files
        await (0, git_1.addAll)(testRepoPath);
        // Commit the files
        const commitMessage = 'Initial commit';
        await (0, git_1.commit)(testRepoPath, commitMessage);
        // Verify the commit was created
        const commits = await (0, git_1.log)(testRepoPath);
        (0, bun_test_1.expect)(commits).toHaveLength(1);
        (0, bun_test_1.expect)(commits[0].commit.message.trim()).toBe(commitMessage);
    });
    (0, bun_test_1.test)('should include deleted files in addAll', async () => {
        // First commit all files
        await (0, git_1.addAll)(testRepoPath);
        await (0, git_1.commit)(testRepoPath, 'Initial commit');
        // Delete a file
        fs_1.default.unlinkSync(path_1.default.join(testRepoPath, 'test1.txt'));
        // Check status before addAll
        const statusBeforeAdd = await (0, git_1.status)(testRepoPath, 'test1.txt');
        (0, bun_test_1.expect)(statusBeforeAdd).toBe('*deleted');
        // Add all changes including deleted file
        await (0, git_1.addAll)(testRepoPath);
        // Check status after addAll
        const statusAfterAdd = await (0, git_1.status)(testRepoPath, 'test1.txt');
        (0, bun_test_1.expect)(statusAfterAdd).toBe('deleted');
    });
    (0, bun_test_1.test)('should create and switch branches', async () => {
        // First commit to main branch
        await (0, git_1.addAll)(testRepoPath);
        await (0, git_1.commit)(testRepoPath, 'Initial commit');
        // Create a new branch
        const branchName = 'feature-branch';
        await (0, git_1.branch)(testRepoPath, branchName);
        // Modify a file in the new branch
        fs_1.default.writeFileSync(path_1.default.join(testRepoPath, 'test1.txt'), 'Modified in feature branch');
        await (0, git_1.add)(testRepoPath, 'test1.txt');
        await (0, git_1.commit)(testRepoPath, 'Feature branch commit');
        // Switch back to main
        await (0, git_1.checkout)(testRepoPath, 'main');
        // Verify file content is from main branch
        (0, bun_test_1.expect)(fs_1.default.readFileSync(path_1.default.join(testRepoPath, 'test1.txt'), 'utf8')).toBe('Hello World');
        // Switch to feature branch again
        await (0, git_1.checkout)(testRepoPath, branchName);
        // Verify file content is from feature branch
        (0, bun_test_1.expect)(fs_1.default.readFileSync(path_1.default.join(testRepoPath, 'test1.txt'), 'utf8')).toBe('Modified in feature branch');
    });
    (0, bun_test_1.test)('should revert changes', async () => {
        // First commit
        await (0, git_1.addAll)(testRepoPath);
        await (0, git_1.commit)(testRepoPath, 'Initial commit');
        // Modify a file
        fs_1.default.writeFileSync(path_1.default.join(testRepoPath, 'test1.txt'), 'Modified content');
        await (0, git_1.add)(testRepoPath, 'test1.txt');
        await (0, git_1.commit)(testRepoPath, 'Modification commit');
        // Verify file is modified
        (0, bun_test_1.expect)(fs_1.default.readFileSync(path_1.default.join(testRepoPath, 'test1.txt'), 'utf8')).toBe('Modified content');
        // Get the commit history
        const commits = await (0, git_1.log)(testRepoPath);
        // Revert to the initial commit
        await (0, git_1.checkout)(testRepoPath, commits[1].oid);
        // Verify file is reverted
        (0, bun_test_1.expect)(fs_1.default.readFileSync(path_1.default.join(testRepoPath, 'test1.txt'), 'utf8')).toBe('Hello World');
    });
    (0, bun_test_1.test)('should get current commit hash', async () => {
        // First commit to get a valid commit hash
        await (0, git_1.addAll)(testRepoPath);
        await (0, git_1.commit)(testRepoPath, 'Initial commit');
        // Get the current commit hash
        const currentCommit = await (0, git_1.getCurrentCommit)(testRepoPath);
        // Get the commit history to verify the hash
        const commits = await (0, git_1.log)(testRepoPath);
        (0, bun_test_1.expect)(currentCommit).toBe(commits[0].oid);
    });
    (0, bun_test_1.test)('should set and get commit display name', async () => {
        // First commit to get a valid commit hash
        await (0, git_1.addAll)(testRepoPath);
        await (0, git_1.commit)(testRepoPath, 'Initial commit');
        // Get the commit hash
        const commits = await (0, git_1.log)(testRepoPath);
        const commitHash = commits[0].oid;
        // Initially, display name should be null
        const initialDisplayName = await (0, git_1.getCommitDisplayName)(testRepoPath, commitHash);
        (0, bun_test_1.expect)(initialDisplayName).toBeNull();
        // Set a display name
        const displayName = 'My Custom Display Name';
        await (0, git_1.updateCommitDisplayName)(testRepoPath, commitHash, displayName);
        // Verify the display name was set correctly
        const retrievedDisplayName = await (0, git_1.getCommitDisplayName)(testRepoPath, commitHash);
        (0, bun_test_1.expect)(retrievedDisplayName).toBe(displayName);
    });
    (0, bun_test_1.test)('should update existing commit display name', async () => {
        // First commit to get a valid commit hash
        await (0, git_1.addAll)(testRepoPath);
        await (0, git_1.commit)(testRepoPath, 'Initial commit');
        // Get the commit hash
        const commits = await (0, git_1.log)(testRepoPath);
        const commitHash = commits[0].oid;
        // Set initial display name
        const initialDisplayName = 'Initial Display Name';
        await (0, git_1.updateCommitDisplayName)(testRepoPath, commitHash, initialDisplayName);
        // Update the display name
        const updatedDisplayName = 'Updated Display Name';
        await (0, git_1.updateCommitDisplayName)(testRepoPath, commitHash, updatedDisplayName);
        // Verify the display name was updated correctly
        const retrievedDisplayName = await (0, git_1.getCommitDisplayName)(testRepoPath, commitHash);
        (0, bun_test_1.expect)(retrievedDisplayName).toBe(updatedDisplayName);
    });
    (0, bun_test_1.test)('should detect changes in repository', async () => {
        // Initially there should be changes (untracked files)
        (0, bun_test_1.expect)(await (0, git_1.isEmptyCommit)(testRepoPath)).toBe(false);
        // Add and commit all files
        await (0, git_1.addAll)(testRepoPath);
        await (0, git_1.commit)(testRepoPath, 'Initial commit');
        // No changes after committing everything
        (0, bun_test_1.expect)(await (0, git_1.isEmptyCommit)(testRepoPath)).toBe(true);
        // Make a change to a file
        fs_1.default.writeFileSync(path_1.default.join(testRepoPath, 'test1.txt'), 'Modified content');
        // Should detect the change
        (0, bun_test_1.expect)(await (0, git_1.isEmptyCommit)(testRepoPath)).toBe(false);
        // Add and commit the changes
        await (0, git_1.addAll)(testRepoPath);
        await (0, git_1.commit)(testRepoPath, 'Modified content');
        // No changes after committing everything
        (0, bun_test_1.expect)(await (0, git_1.isEmptyCommit)(testRepoPath)).toBe(true);
    });
});
//# sourceMappingURL=git.test.js.map