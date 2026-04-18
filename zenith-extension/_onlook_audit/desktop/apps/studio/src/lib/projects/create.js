"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateManager = exports.CreateState = void 0;
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
const _1 = require(".");
const utils_1 = require("../utils");
var CreateState;
(function (CreateState) {
    CreateState["PROMPT"] = "prompting";
    CreateState["IMPORT"] = "import";
    CreateState["CREATE_LOADING"] = "create-loading";
    CreateState["ERROR"] = "error";
})(CreateState || (exports.CreateState = CreateState = {}));
const SLOW_CREATE_MESSAGES = [
    { time: 15000, message: 'Finalizing layout...' },
    { time: 30000, message: 'Drafting copy...' },
    { time: 45000, message: 'Finalizing design...' },
    { time: 60000, message: 'Completing setup...' },
    { time: 75000, message: 'Starting project...' },
];
class CreateManager {
    projectsManager;
    createState = CreateState.PROMPT;
    progress = 0;
    message = null;
    error = null;
    cleanupListener = null;
    slowConnectionTimer = null;
    constructor(projectsManager) {
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this);
        this.listenForPromptProgress();
    }
    startSlowConnectionTimer() {
        if (this.slowConnectionTimer) {
            clearTimeout(this.slowConnectionTimer);
        }
        SLOW_CREATE_MESSAGES.forEach(({ time, message }) => {
            setTimeout(() => {
                if (this.state === CreateState.CREATE_LOADING) {
                    this.message = message;
                    this.progress += 10;
                }
            }, time);
        });
        this.slowConnectionTimer = setTimeout(() => { }, Math.max(...SLOW_CREATE_MESSAGES.map((m) => m.time)));
    }
    clearSlowConnectionTimer() {
        if (this.slowConnectionTimer) {
            clearTimeout(this.slowConnectionTimer);
            this.slowConnectionTimer = null;
        }
    }
    listenForPromptProgress() {
        window.api.on(constants_1.MainChannels.CREATE_NEW_PROJECT_PROMPT_CALLBACK, ({ message, progress }) => {
            this.progress = progress;
            this.message = message;
        });
        this.cleanupListener = () => {
            window.api.removeAllListeners(constants_1.MainChannels.CREATE_NEW_PROJECT_PROMPT_CALLBACK);
        };
        return this.cleanupListener;
    }
    get state() {
        return this.createState;
    }
    set state(newState) {
        this.createState = newState;
        if (newState === CreateState.CREATE_LOADING) {
            this.startSlowConnectionTimer();
        }
        else {
            this.clearSlowConnectionTimer();
        }
    }
    async sendPrompt(prompt, images, blank = false) {
        (0, utils_1.sendAnalytics)('prompt create project', {
            prompt,
            blank,
        });
        this.state = CreateState.CREATE_LOADING;
        this.error = null;
        let result;
        if (blank) {
            result = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.CREATE_NEW_BLANK_PROJECT);
        }
        else {
            result = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.CREATE_NEW_PROJECT_PROMPT, {
                prompt,
                images,
            });
        }
        if (result.success && result.response?.projectPath) {
            this.state = CreateState.PROMPT;
            const newProject = this.createProject(result.response.projectPath);
            this.projectsManager.project = newProject;
            setTimeout(() => {
                this.projectsManager.projectsTab = _1.ProjectTabs.PROJECTS;
            }, 100);
            // Generate suggestions
            if (!blank && result.response?.content) {
                this.projectsManager.editorEngine?.chat.suggestions.generateCreatedSuggestions(prompt, result.response.content, images);
            }
            this.clearSlowConnectionTimer();
            setTimeout(() => {
                this.projectsManager.runner?.startIfPortAvailable();
            }, 1000);
            (0, utils_1.sendAnalytics)('prompt create project success');
        }
        else {
            this.error = result.error || 'Failed to create project';
            this.state = CreateState.ERROR;
            (0, utils_1.sendAnalytics)('prompt create project error', {
                error: this.error,
            });
        }
    }
    createProject(projectPath) {
        const projectName = 'New Project';
        const projectUrl = 'http://localhost:3000';
        const projectCommands = {
            install: 'npm install',
            run: 'npm run dev',
            build: 'npm run build',
        };
        return this.projectsManager.createProject(projectName, projectUrl, projectPath, projectCommands);
    }
    async cancel() {
        await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.CANCEL_CREATE_NEW_PROJECT_PROMPT);
        this.state = CreateState.PROMPT;
    }
    cleanup() {
        if (this.cleanupListener) {
            this.cleanupListener();
            this.cleanupListener = null;
        }
        this.clearSlowConnectionTimer();
    }
}
exports.CreateManager = CreateManager;
//# sourceMappingURL=create.js.map