"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionManager = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
class SuggestionManager {
    projectsManager;
    projectId = null;
    _suggestions = [];
    _shouldHide = false;
    constructor(projectsManager) {
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this);
        (0, mobx_1.reaction)(() => this.projectsManager.project, (current) => this.getCurrentProjectSuggestions(current));
    }
    get suggestions() {
        return this._suggestions || [];
    }
    set suggestions(suggestions) {
        this._suggestions = suggestions;
        this.saveSuggestionsToStorage();
    }
    get shouldHide() {
        return this._shouldHide;
    }
    set shouldHide(value) {
        this._shouldHide = value;
    }
    async getCurrentProjectSuggestions(project) {
        if (!project) {
            return;
        }
        if (this.projectId === project.id) {
            return;
        }
        this.projectId = project.id;
        this._suggestions = await this.getSuggestions(project.id);
    }
    async getSuggestions(projectId) {
        const res = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_SUGGESTIONS_BY_PROJECT, { projectId });
        if (!res) {
            console.error('No suggestions found');
            return [];
        }
        return res;
    }
    saveSuggestionsToStorage() {
        if (!this.projectId) {
            console.error('No project id found');
            return;
        }
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SAVE_SUGGESTIONS, {
            suggestions: {
                id: this.projectId,
                projectId: this.projectId,
                suggestions: this._suggestions,
            },
        });
    }
    async generateCreatedSuggestions(prompt, response, images) {
        (0, utils_1.sendAnalytics)('generate suggestions');
        const systemMessage = {
            role: 'system',
            content: 'You are a React and Tailwind CSS expert. You will be given a generated website and the prompt the user used to describe it. Please generate 3 more prompts that they can use to further improve the page. Try to reply in the same language as the original prompt.',
            experimental_providerMetadata: {
                anthropic: { cacheControl: { type: 'ephemeral' } },
            },
        };
        const messages = this.getMessages(prompt, response, images);
        const newSuggestions = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GENERATE_SUGGESTIONS, {
            messages: [systemMessage, ...messages],
        });
        if (newSuggestions) {
            this.suggestions = newSuggestions;
            (0, utils_1.sendAnalytics)('generated suggestions');
        }
        else {
            console.error('Failed to generate suggestions');
            (0, utils_1.sendAnalytics)('generate suggestions failed');
        }
    }
    async generateNextSuggestions(messages) {
        const systemMessage = {
            role: 'system',
            content: 'Given the conversation above, please give 3 more prompts the users can use to improve their website. Please make sure the prompts are realistic, detailed, and implementable within their current project. The suggestions are aimed to make the site better for the original intent. Try to answer in the same language as the user.',
            experimental_providerMetadata: {
                anthropic: { cacheControl: { type: 'ephemeral' } },
            },
        };
        const newSuggestions = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GENERATE_SUGGESTIONS, {
            messages: [...messages, systemMessage],
        });
        if (newSuggestions) {
            this.suggestions = newSuggestions;
            (0, utils_1.sendAnalytics)('generated suggestions');
        }
        else {
            console.error('Failed to generate suggestions');
            (0, utils_1.sendAnalytics)('generate suggestions failed');
        }
    }
    getMessages(prompt, response, images) {
        const promptContent = `This was my previous prompt: ${prompt}.${images.length > 0 ? 'I also included the images above.' : ''}`;
        let content = promptContent;
        if (images.length > 0) {
            content = [
                ...images.map((image) => ({
                    type: 'image',
                    image: image.content,
                    mimeType: image.mimeType,
                })),
                {
                    type: 'text',
                    text: promptContent,
                },
            ];
        }
        return [
            {
                role: 'user',
                content,
            },
            {
                role: 'assistant',
                content: response,
            },
            {
                role: 'user',
                content: 'What should I prompt next to make this page better?',
            },
        ];
    }
}
exports.SuggestionManager = SuggestionManager;
//# sourceMappingURL=suggestions.js.map