"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitManager = exports.ONLOOK_DISPLAY_NAME_NOTE_REF = void 0;
const mobx_1 = require("mobx");
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const constants_1 = require("@onlook/constants");
const git_1 = require("@/utils/git");
exports.ONLOOK_DISPLAY_NAME_NOTE_REF = 'refs/notes/onlook-display-name';
class GitManager {
    sandbox;
    commits = null;
    isLoadingCommits = false;
    constructor(sandbox) {
        this.sandbox = sandbox;
        (0, mobx_1.makeAutoObservable)(this);
    }
    /**
     * Initialize git manager - auto-initializes repo if needed and preloads commits
     */
    async init() {
        const isInitialized = await this.isRepoInitialized();
        if (!isInitialized) {
            await this.initRepo();
        }
        await this.listCommits();
    }
    /**
     * Check if git repository is initialized
     */
    async isRepoInitialized() {
        try {
            return (await this.sandbox.fileExists('.git')) || false;
        }
        catch (error) {
            console.error('Error checking if repository is initialized:', error);
            return false;
        }
    }
    /**
     * Ensure git config is set with default values if not already configured
     */
    async ensureGitConfig() {
        try {
            if (!this.sandbox.session) {
                console.error('No sandbox session available');
                return false;
            }
            // Check if user.name is set
            const nameResult = await this.runCommand('git config user.name');
            const emailResult = await this.runCommand('git config user.email');
            const hasName = nameResult.success && nameResult.output.trim();
            const hasEmail = emailResult.success && emailResult.output.trim();
            // If both are already set, no need to configure
            if (hasName && hasEmail) {
                return true;
            }
            // Set user.name if not configured
            if (!hasName) {
                const nameConfigResult = await this.runCommand('git config user.name "Onlook"');
                if (!nameConfigResult.success) {
                    console.error('Failed to set git user.name:', nameConfigResult.error);
                }
            }
            // Set user.email if not configured
            if (!hasEmail) {
                const emailConfigResult = await this.runCommand(`git config user.email "${constants_1.SUPPORT_EMAIL}"`);
                if (!emailConfigResult.success) {
                    console.error('Failed to set git user.email:', emailConfigResult.error);
                }
            }
            return true;
        }
        catch (error) {
            console.error('Failed to ensure git config:', error);
            return false;
        }
    }
    /**
     * Initialize git repository
     */
    async initRepo() {
        try {
            const isInitialized = await this.isRepoInitialized();
            if (isInitialized) {
                console.log('Repository already initialized');
                return true;
            }
            if (!this.sandbox.session) {
                console.error('No sandbox session available');
                return false;
            }
            console.log('Initializing git repository...');
            // Initialize git repository
            const initResult = await this.runCommand('git init');
            if (!initResult.success) {
                console.error('Failed to initialize git repository:', initResult.error);
                return false;
            }
            // Configure git user (required for commits)
            await this.ensureGitConfig();
            // Set default branch to main
            await this.runCommand('git branch -M main');
            console.log('Git repository initialized successfully');
            return true;
        }
        catch (error) {
            console.error('Failed to initialize git repository:', error);
            return false;
        }
    }
    /**
     * Get repository status
     */
    async getStatus() {
        try {
            const status = await this.sandbox.session.provider?.gitStatus({});
            if (!status) {
                console.error('Failed to get git status');
                return null;
            }
            return {
                files: Object.keys(status.changedFiles || {}),
            };
        }
        catch (error) {
            console.error('Failed to get git status:', error);
            return null;
        }
    }
    /**
     * Stage all files
     */
    async stageAll() {
        return this.runCommand('git add .');
    }
    /**
     * Create a commit (low-level) - auto-refreshes commits after successful commit
     */
    async commit(message) {
        const sanitizedMessage = (0, git_1.sanitizeCommitMessage)(message);
        const escapedMessage = (0, git_1.prepareCommitMessage)(sanitizedMessage);
        const result = await this.runCommand(`git commit --allow-empty --no-verify -m ${escapedMessage}`);
        if (result.success) {
            await this.listCommits();
        }
        return result;
    }
    /**
     * Create a commit (high-level) - handles full flow: stage, config, commit
     */
    async createCommit(message = 'New Onlook backup') {
        const status = await this.getStatus();
        // Stage all files
        const addResult = await this.stageAll();
        if (!addResult.success) {
            return addResult;
        }
        // Ensure git config
        await this.ensureGitConfig();
        // Create the commit
        return await this.commit(message);
    }
    /**
     * List commits with formatted output - stores results in this.commits
     */
    async listCommits(maxRetries = 2) {
        this.isLoadingCommits = true;
        let lastError = null;
        try {
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    // Use a more robust format with unique separators and handle multiline messages
                    const result = await this.runCommand('git --no-pager log --pretty=format:"COMMIT_START%n%H%n%an <%ae>%n%ad%n%B%nCOMMIT_END" --date=iso');
                    if (result.success && result.output) {
                        const parsedCommits = this.parseGitLog(result.output);
                        // Enhance commits with display names from notes
                        if (parsedCommits.length > 0) {
                            const enhancedCommits = await Promise.all(parsedCommits.map(async (commit) => {
                                const displayName = await this.getCommitNote(commit.oid);
                                return {
                                    ...commit,
                                    displayName: displayName || commit.message,
                                };
                            }));
                            this.commits = enhancedCommits;
                            return enhancedCommits;
                        }
                        this.commits = parsedCommits;
                        return parsedCommits;
                    }
                    // If git command failed but didn't throw, treat as error for retry logic
                    lastError = new Error(`Git command failed: ${result.error || 'Unknown error'}`);
                    if (attempt < maxRetries) {
                        // Wait before retry with exponential backoff
                        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
                        continue;
                    }
                    this.commits = [];
                    return [];
                }
                catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    console.warn(`Attempt ${attempt + 1} failed to list commits:`, lastError.message);
                    if (attempt < maxRetries) {
                        // Wait before retry with exponential backoff
                        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
                        continue;
                    }
                    console.error('All attempts failed to list commits', lastError);
                    this.commits = [];
                    return [];
                }
            }
            this.commits = [];
            return [];
        }
        finally {
            this.isLoadingCommits = false;
        }
    }
    /**
     * Checkout/restore to a specific commit - auto-refreshes commits after restore
     */
    async restoreToCommit(commitOid) {
        const result = await (0, git_1.withSyncPaused)(this.sandbox.syncEngine, () => {
            return this.runCommand(`git restore --source ${commitOid} .`);
        });
        if (result.success) {
            await this.listCommits();
        }
        return result;
    }
    /**
     * Add a display name note to a commit - updates commit in local cache
     */
    async addCommitNote(commitOid, displayName) {
        const sanitizedDisplayName = (0, git_1.sanitizeCommitMessage)(displayName);
        const escapedDisplayName = (0, git_1.prepareCommitMessage)(sanitizedDisplayName);
        const result = await this.runCommand(`git --no-pager notes --ref=${exports.ONLOOK_DISPLAY_NAME_NOTE_REF} add -f -m ${escapedDisplayName} ${commitOid}`);
        if (result.success && this.commits) {
            // Update the commit in local cache instead of re-fetching all commits
            const commitIndex = this.commits.findIndex((commit) => commit.oid === commitOid);
            if (commitIndex !== -1) {
                this.commits[commitIndex].displayName = sanitizedDisplayName;
            }
        }
        return result;
    }
    /**
     * Get display name from commit notes
     */
    async getCommitNote(commitOid) {
        try {
            const result = await this.runCommand(`git --no-pager notes --ref=${exports.ONLOOK_DISPLAY_NAME_NOTE_REF} show ${commitOid}`, true);
            if (result.success && result.output) {
                const cleanOutput = this.formatGitLogOutput(result.output);
                return cleanOutput || null;
            }
            return null;
        }
        catch (error) {
            console.warn('Failed to get commit note', error);
            return null;
        }
    }
    /**
     * Run a git command through the sandbox session
     */
    runCommand(command, ignoreError = false) {
        return this.sandbox.session.runCommand(command, undefined, ignoreError);
    }
    /**
     * Parse git log output into GitCommit objects
     */
    parseGitLog(rawOutput) {
        const cleanOutput = this.formatGitLogOutput(rawOutput);
        if (!cleanOutput) {
            return [];
        }
        const commits = [];
        // Split by COMMIT_START and COMMIT_END markers
        const commitBlocks = cleanOutput.split('COMMIT_START').filter((block) => block.trim());
        for (const block of commitBlocks) {
            // Remove COMMIT_END if present
            const cleanBlock = block.replace(/COMMIT_END\s*$/, '').trim();
            if (!cleanBlock)
                continue;
            // Split the block into lines
            const lines = cleanBlock.split('\n');
            if (lines.length < 4)
                continue; // Need at least hash, author, date, and message
            const hash = lines[0]?.trim();
            const authorLine = lines[1]?.trim();
            const dateLine = lines[2]?.trim();
            // Everything from line 3 onwards is the commit message (including empty lines)
            const messageLines = lines.slice(3);
            // Join all message lines and trim only leading/trailing whitespace
            const message = messageLines.join('\n').trim();
            if (!hash || !authorLine || !dateLine)
                continue;
            // Parse author name and email
            const authorMatch = /^(.+?)\s*<(.+?)>$/.exec(authorLine);
            const authorName = authorMatch?.[1]?.trim() || authorLine;
            const authorEmail = authorMatch?.[2]?.trim() || '';
            // Parse date to timestamp
            let timestamp;
            try {
                timestamp = Math.floor(new Date(dateLine).getTime() / 1000);
                // Validate timestamp
                if (isNaN(timestamp) || timestamp < 0) {
                    timestamp = Math.floor(Date.now() / 1000);
                }
            }
            catch (error) {
                console.warn('Failed to parse commit date:', dateLine, error);
                timestamp = Math.floor(Date.now() / 1000);
            }
            // Use the first line of the message as display name, or the full message if it's short
            const displayMessage = message.split('\n')[0] || 'No message';
            commits.push({
                oid: hash,
                message: message || 'No message',
                author: {
                    name: authorName,
                    email: authorEmail,
                },
                timestamp: timestamp,
                displayName: displayMessage,
            });
        }
        return commits;
    }
    formatGitLogOutput(input) {
        // Use strip-ansi library for robust ANSI escape sequence removal
        let cleanOutput = (0, strip_ansi_1.default)(input);
        // Remove any remaining control characters except newline and tab
        cleanOutput = cleanOutput.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        // Remove null bytes
        cleanOutput = cleanOutput.replace(/\0/g, '');
        return cleanOutput.trim();
    }
}
exports.GitManager = GitManager;
//# sourceMappingURL=git.js.map