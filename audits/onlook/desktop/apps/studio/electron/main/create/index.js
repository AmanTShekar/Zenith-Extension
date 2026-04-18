"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectCreator = void 0;
const coder_1 = require("@onlook/ai/src/coder");
const prompt_1 = require("@onlook/ai/src/prompt");
const models_1 = require("@onlook/models");
const chat_1 = require("@onlook/models/chat");
const constants_1 = require("@onlook/models/constants");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const __1 = require("..");
const chat_2 = __importDefault(require("../chat"));
const helpers_1 = require("./helpers");
const install_1 = require("./install");
class ProjectCreator {
    static instance;
    abortController = null;
    static getInstance() {
        if (!ProjectCreator.instance) {
            ProjectCreator.instance = new ProjectCreator();
        }
        return ProjectCreator.instance;
    }
    async executeProjectCreation(action) {
        this.cancel();
        this.abortController = new AbortController();
        try {
            const result = await action();
            return { success: true, response: result };
        }
        catch (error) {
            if (error.name === 'AbortError') {
                return { success: false, cancelled: true };
            }
            console.error('Failed to create project:', error);
            return { success: false, error: error.message };
        }
        finally {
            this.abortController = null;
        }
    }
    async createProject(prompt, images) {
        return this.executeProjectCreation(async () => {
            const [generatedPage, projectPath] = await Promise.all([
                this.generatePage(prompt, images),
                this.runCreate(),
            ]);
            if (this.abortController?.signal.aborted) {
                throw new Error('AbortError');
            }
            await this.applyGeneratedPage(projectPath, generatedPage);
            return { projectPath, content: generatedPage.content };
        });
    }
    async createBlankProject() {
        return this.executeProjectCreation(async () => {
            const projectPath = await this.runCreate();
            return { projectPath, content: '' };
        });
    }
    cancel() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }
    async generatePage(prompt, images) {
        if (!this.abortController) {
            throw new Error('No active creation process');
        }
        const messages = this.getMessages(prompt, images);
        this.emitPromptProgress('Generating page...', 10);
        const systemPrompt = new prompt_1.PromptProvider().getCreatePageSystemPrompt();
        const systemMessage = {
            role: 'system',
            content: systemPrompt,
            experimental_providerMetadata: {
                anthropic: { cacheControl: { type: 'ephemeral' } },
            },
        };
        const response = await chat_2.default.stream([systemMessage, ...messages], chat_1.StreamRequestType.CREATE, {
            abortController: this.abortController,
            skipSystemPrompt: true,
        });
        if (response.type !== 'full') {
            throw new Error('Failed to generate page. ' + this.getStreamErrorMessage(response));
        }
        const content = (0, coder_1.extractCodeBlocks)(response.text);
        return {
            path: prompt_1.PAGE_SYSTEM_PROMPT.defaultPath,
            content,
        };
    }
    async runCreate() {
        if (!this.abortController) {
            throw new Error('No active creation process');
        }
        if (this.abortController.signal.aborted) {
            throw new Error('AbortError');
        }
        const projectsPath = (0, helpers_1.getCreateProjectPath)();
        await fs_1.default.promises.mkdir(projectsPath, { recursive: true });
        const projectName = `project-${Date.now()}`;
        await (0, install_1.createProject)(projectName, projectsPath, this.createCallback.bind(this));
        return path_1.default.join(projectsPath, projectName);
    }
    createCallback = (stage, message) => {
        let progress = 0;
        switch (stage) {
            case models_1.CreateStage.CLONING:
                progress = 20;
                break;
            case models_1.CreateStage.GIT_INIT:
                progress = 30;
                break;
            case models_1.CreateStage.INSTALLING:
                progress = 40;
                break;
            case models_1.CreateStage.COMPLETE:
                progress = 50;
                this.emitPromptProgress('Project created! Generating page...', progress);
                return;
        }
        this.emitPromptProgress(message, progress);
    };
    emitPromptProgress = (message, progress) => {
        __1.mainWindow?.webContents.send(constants_1.MainChannels.CREATE_NEW_PROJECT_PROMPT_CALLBACK, {
            message,
            progress,
        });
    };
    getMessages(prompt, images) {
        const promptContent = `${images.length > 0 ? 'Refer to the images above. ' : ''}Create a landing page that matches this description: ${prompt}
Use this as the starting template:
${prompt_1.PAGE_SYSTEM_PROMPT.defaultContent}`;
        // For text-only messages
        if (images.length === 0) {
            return [
                {
                    role: 'user',
                    content: promptContent,
                },
            ];
        }
        // For messages with images
        return [
            {
                role: 'user',
                content: [
                    ...images.map((image) => ({
                        type: 'image',
                        image: image.content,
                        mimeType: image.mimeType,
                    })),
                    {
                        type: 'text',
                        text: promptContent,
                    },
                ],
            },
        ];
    }
    async applyGeneratedPage(projectPath, generatedPage) {
        const pagePath = path_1.default.join(projectPath, generatedPage.path);
        // Create recursive directories if they don't exist
        await fs_1.default.promises.mkdir(path_1.default.dirname(pagePath), { recursive: true });
        await fs_1.default.promises.writeFile(pagePath, generatedPage.content);
    }
    getStreamErrorMessage(streamResult) {
        if (streamResult.type === 'error') {
            return streamResult.message;
        }
        if (streamResult.type === 'rate-limited') {
            if (streamResult.rateLimitResult) {
                const requestLimit = streamResult.rateLimitResult.reason === 'daily'
                    ? streamResult.rateLimitResult.daily_requests_limit
                    : streamResult.rateLimitResult.monthly_requests_limit;
                return `You reached your ${streamResult.rateLimitResult.reason} ${requestLimit} message limit.`;
            }
            return 'Rate limit exceeded. Please try again later.';
        }
        if (streamResult.type === 'partial') {
            return 'Returned partial response';
        }
        return 'Unknown error';
    }
}
exports.ProjectCreator = ProjectCreator;
exports.default = ProjectCreator.getInstance();
//# sourceMappingURL=index.js.map