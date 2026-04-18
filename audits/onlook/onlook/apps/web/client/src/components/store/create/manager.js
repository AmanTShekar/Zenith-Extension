"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateManager = void 0;
const client_1 = require("@/trpc/client");
const constants_1 = require("@onlook/constants");
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const mobx_1 = require("mobx");
const helper_1 = require("../editor/pages/helper");
class CreateManager {
    error = null;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
    }
    async generateProjectName(prompt) {
        try {
            const generatedName = await client_1.api.project.generateName.mutate({
                prompt: prompt,
            });
            return generatedName;
        }
        catch (error) {
            console.error('Error generating project name:', error);
            return 'New Project';
        }
    }
    async startCreate(userId, prompt, images) {
        this.error = null;
        try {
            if (!userId) {
                console.error('No user ID found');
                return;
            }
            const config = {
                title: `Prompted project - ${userId}`,
                tags: ['prompt', userId],
            };
            const [{ sandboxId, previewUrl }, projectName] = await Promise.all([
                client_1.api.sandbox.fork.mutate({
                    sandbox: constants_1.SandboxTemplates[constants_1.Templates.EMPTY_NEXTJS],
                    config,
                }),
                this.generateProjectName(prompt)
            ]);
            const project = (0, db_1.createDefaultProject)({
                overrides: {
                    name: projectName,
                },
            });
            const newProject = await client_1.api.project.create.mutate({
                project,
                userId,
                sandboxId,
                sandboxUrl: previewUrl,
                creationData: {
                    context: [
                        {
                            type: models_1.CreateRequestContextType.PROMPT,
                            content: prompt,
                        },
                        ...images.map((image) => ({
                            type: models_1.CreateRequestContextType.IMAGE,
                            content: image.content,
                            mimeType: image.mimeType,
                        })),
                    ],
                },
            });
            return newProject;
        }
        catch (error) {
            console.error(error);
            this.error = error instanceof Error ? error.message : 'An unknown error occurred';
        }
    }
    async startGitHubTemplate(userId, repoUrl) {
        this.error = null;
        try {
            if (!userId) {
                console.error('No user ID found');
                return;
            }
            const { owner, repo } = (0, helper_1.parseRepoUrl)(repoUrl);
            const { branch, isPrivateRepo } = await client_1.api.github.validate.mutate({
                owner: owner,
                repo: repo
            });
            if (isPrivateRepo) {
                this.error = "The repository you've provided is private. Only public repositories are supported";
                return;
            }
            const [{ sandboxId, previewUrl }, projectName] = await Promise.all([
                this.createSandboxFromGithub(repoUrl, branch),
                this.generateProjectName(`Import from GitHub repository: ${repo}`)
            ]);
            const project = (0, db_1.createDefaultProject)({
                overrides: {
                    name: projectName,
                },
            });
            const newProject = await client_1.api.project.create.mutate({
                project,
                userId,
                sandboxId,
                sandboxUrl: previewUrl,
            });
            return newProject;
        }
        catch (error) {
            console.error(error);
            this.error = error instanceof Error ? error.message : 'An unknown error occurred';
        }
    }
    async createSandboxFromGithub(repoUrl, branch) {
        return await client_1.api.sandbox.createFromGitHub.mutate({
            repoUrl,
            branch
        });
    }
}
exports.CreateManager = CreateManager;
//# sourceMappingURL=manager.js.map