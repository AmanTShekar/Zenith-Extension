"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRouter = void 0;
const env_1 = require("@/env");
const trpc_1 = require("@/server/api/trpc");
const server_1 = require("@/utils/analytics/server");
const firecrawl_js_1 = __importDefault(require("@mendable/firecrawl-js"));
const ai_1 = require("@onlook/ai");
const constants_1 = require("@onlook/constants");
const db_1 = require("@onlook/db");
const image_server_1 = require("@onlook/image-server");
const models_1 = require("@onlook/models");
const utility_1 = require("@onlook/utility");
const ai_2 = require("ai");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const createRequest_1 = require("./createRequest");
const fork_1 = require("./fork");
const helper_1 = require("./helper");
exports.projectRouter = (0, trpc_1.createTRPCRouter)({
    hasAccess: trpc_1.protectedProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string() }))
        .query(async ({ ctx, input }) => {
        const user = ctx.user;
        const project = await ctx.db.query.projects.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.projects.id, input.projectId),
            with: {
                userProjects: {
                    where: (0, drizzle_orm_1.eq)(db_1.userProjects.userId, user.id),
                },
            },
        });
        return !!project && project.userProjects.length > 0;
    }),
    createRequest: createRequest_1.projectCreateRequestRouter,
    captureScreenshot: trpc_1.protectedProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string() }))
        .mutation(async ({ ctx, input }) => {
        try {
            await (0, helper_1.verifyProjectAccess)(ctx.db, ctx.user.id, input.projectId);
            if (!env_1.env.FIRECRAWL_API_KEY) {
                throw new Error('FIRECRAWL_API_KEY is not configured');
            }
            const branch = await ctx.db.query.branches.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.branches.projectId, input.projectId), (0, drizzle_orm_1.eq)(db_1.branches.isDefault, true)),
                with: {
                    frames: true,
                },
            });
            if (!branch) {
                throw new Error('Branch not found');
            }
            if (!branch.sandboxId) {
                throw new Error('No sandbox found for branch');
            }
            // Extract port from existing frame URL or fall back to 3000
            const port = (0, helper_1.extractCsbPort)(branch.frames) ?? 3000;
            const url = (0, constants_1.getSandboxPreviewUrl)(branch.sandboxId, port);
            const app = new firecrawl_js_1.default({ apiKey: env_1.env.FIRECRAWL_API_KEY });
            // Optional: Add actions to click the button for CSB free tier
            // const _csbFreeActions = [{
            //     type: 'click',
            //     selector: '#btn-answer-yes',
            // }];
            const result = await app.scrapeUrl(url, {
                formats: ['screenshot'],
                onlyMainContent: true,
                timeout: 10000,
            });
            if (!result.success) {
                throw new Error(`Failed to scrape URL: ${result.error || 'Unknown error'}`);
            }
            const screenshotUrl = result.screenshot;
            if (!screenshotUrl) {
                throw new Error('Invalid screenshot URL');
            }
            const response = await fetch(screenshotUrl, {
                signal: AbortSignal.timeout(10000),
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch screenshot: ${response.status} ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const mimeType = response.headers.get('content-type') ?? 'image/png';
            const buffer = Buffer.from(arrayBuffer);
            const compressedImage = await (0, image_server_1.compressImageServer)(buffer, undefined, {
                quality: 80,
                width: 1024,
                height: 1024,
                format: 'jpeg',
            });
            const useCompressed = !!compressedImage.buffer;
            const finalMimeType = useCompressed ? 'image/jpeg' : mimeType;
            const finalBuffer = useCompressed ? (compressedImage.buffer ?? buffer) : buffer;
            const path = (0, utility_1.getScreenshotPath)(input.projectId, finalMimeType);
            const { data, error } = await ctx.supabase.storage
                .from(constants_1.STORAGE_BUCKETS.PREVIEW_IMAGES)
                .upload(path, finalBuffer, {
                contentType: finalMimeType,
            });
            if (error) {
                throw new Error(`Supabase upload error: ${error.message}`);
            }
            if (!data) {
                throw new Error('No data returned from storage upload');
            }
            const { previewImgUrl, previewImgPath, previewImgBucket, updatedPreviewImgAt, } = (0, db_1.toDbPreviewImg)({
                type: 'storage',
                storagePath: {
                    bucket: constants_1.STORAGE_BUCKETS.PREVIEW_IMAGES,
                    path: data.path,
                },
                updatedAt: new Date(),
            });
            await ctx.db.update(db_1.projects)
                .set({
                previewImgUrl,
                previewImgPath,
                previewImgBucket,
                updatedPreviewImgAt,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(db_1.projects.id, input.projectId));
            return { success: true, path: data.path };
        }
        catch (error) {
            console.error('Error capturing project screenshot:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }),
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        excludeProjectId: zod_1.z.string().optional(),
    }).optional())
        .query(async ({ ctx, input }) => {
        const fetchedUserProjects = await ctx.db.query.userProjects.findMany({
            where: input?.excludeProjectId ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.userProjects.userId, ctx.user.id), (0, drizzle_orm_1.ne)(db_1.userProjects.projectId, input.excludeProjectId)) : (0, drizzle_orm_1.eq)(db_1.userProjects.userId, ctx.user.id),
            with: {
                project: true,
            },
            limit: input?.limit,
        });
        return fetchedUserProjects.map((userProject) => (0, db_1.fromDbProject)(userProject.project)).sort((a, b) => new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime());
    }),
    get: trpc_1.protectedProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string() }))
        .query(async ({ ctx, input }) => {
        const project = await ctx.db.query.projects.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.projects.id, input.projectId),
        });
        if (!project) {
            console.error('project not found');
            return null;
        }
        return (0, db_1.fromDbProject)(project);
    }),
    getProjectWithCanvas: trpc_1.protectedProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string() }))
        .query(async ({ ctx, input }) => {
        const project = await ctx.db.query.projects.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.projects.id, input.projectId),
            with: {
                canvas: {
                    with: {
                        frames: true,
                        userCanvases: {
                            where: (0, drizzle_orm_1.eq)(db_1.userCanvases.userId, ctx.user.id),
                        },
                    },
                },
            },
        });
        if (!project) {
            console.error('project not found');
            return null;
        }
        const canvas = project.canvas ?? (0, db_1.createDefaultCanvas)(project.id);
        const userCanvas = project.canvas?.userCanvases[0] ?? (0, db_1.createDefaultUserCanvas)(ctx.user.id, canvas.id);
        return {
            project: (0, db_1.fromDbProject)(project),
            userCanvas: (0, db_1.fromDbCanvas)(userCanvas),
            frames: project.canvas?.frames.map(db_1.fromDbFrame) ?? [],
        };
    }),
    create: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        project: db_1.projectInsertSchema,
        userId: zod_1.z.string(),
        sandboxId: zod_1.z.string(),
        sandboxUrl: zod_1.z.string(),
        creationData: db_1.projectCreateRequestInsertSchema
            .omit({
            projectId: true,
        })
            .optional(),
    }))
        .mutation(async ({ ctx, input }) => {
        return await ctx.db.transaction(async (tx) => {
            // 1. Insert the new project
            const [newProject] = await tx.insert(db_1.projects).values(input.project).returning();
            if (!newProject) {
                throw new Error('Failed to create project in database');
            }
            // 2. Create the default branch
            const newBranch = (0, db_1.createDefaultBranch)({
                projectId: newProject.id,
                sandboxId: input.sandboxId,
            });
            await tx.insert(db_1.branches).values(newBranch);
            // 3. Create the association in the junction table
            await tx.insert(db_1.userProjects).values({
                userId: input.userId,
                projectId: newProject.id,
                role: models_1.ProjectRole.OWNER,
            });
            // 4. Create the default canvas
            const newCanvas = (0, db_1.createDefaultCanvas)(newProject.id);
            await tx.insert(db_1.canvases).values(newCanvas);
            const newUserCanvas = (0, db_1.createDefaultUserCanvas)(input.userId, newCanvas.id, {
                x: '120',
                y: '120',
                scale: '0.56',
            });
            await tx.insert(db_1.userCanvases).values(newUserCanvas);
            // 5. Create the default frame
            const desktopFrame = (0, db_1.createDefaultFrame)({
                canvasId: newCanvas.id,
                branchId: newBranch.id,
                url: input.sandboxUrl,
                type: db_1.DefaultFrameType.DESKTOP,
            });
            await tx.insert(db_1.frames).values(desktopFrame);
            // 6. Create the default chat conversation
            await tx.insert(db_1.conversations).values((0, db_1.createDefaultConversation)(newProject.id));
            // 7. Create the creation request
            if (input.creationData) {
                await tx.insert(db_1.projectCreateRequests).values({
                    ...input.creationData,
                    status: models_1.ProjectCreateRequestStatus.PENDING,
                    projectId: newProject.id,
                });
            }
            (0, server_1.trackEvent)({
                distinctId: input.userId,
                event: 'user_create_project',
                properties: {
                    projectId: newProject.id,
                },
            });
            return newProject;
        });
    }),
    fork: fork_1.fork,
    generateName: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        prompt: zod_1.z.string(),
    }))
        .mutation(async ({ ctx, input }) => {
        try {
            const { model, providerOptions, headers } = (0, ai_1.initModel)({
                provider: models_1.LLMProvider.OPENROUTER,
                model: models_1.OPENROUTER_MODELS.OPEN_AI_GPT_5_NANO,
            });
            const MAX_NAME_LENGTH = 50;
            const result = await (0, ai_2.generateText)({
                model,
                headers,
                prompt: `Generate a concise and meaningful project name (2-4 words maximum) that reflects the main purpose or theme of the project based on user's creation prompt. Generate only the project name, nothing else. Keep it short and descriptive. User's creation prompt: <prompt>${input.prompt}</prompt>`,
                providerOptions,
                maxOutputTokens: 50,
                experimental_telemetry: {
                    isEnabled: true, metadata: {
                        userId: ctx.user.id,
                        tags: ['project-name-generation'],
                    }
                },
            });
            const generatedName = result.text.trim();
            if (generatedName && generatedName.length > 0 && generatedName.length <= MAX_NAME_LENGTH) {
                return generatedName;
            }
            return 'New Project';
        }
        catch (error) {
            console.error('Error generating project name:', error);
            return 'New Project';
        }
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.transaction(async (tx) => {
            await (0, helper_1.verifyProjectAccess)(tx, ctx.user.id, input.id);
            await tx.delete(db_1.userProjects).where((0, drizzle_orm_1.eq)(db_1.userProjects.projectId, input.id));
            await tx.delete(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.id, input.id));
        });
    }),
    getPreviewProjects: trpc_1.protectedProcedure
        .input(zod_1.z.object({ userId: zod_1.z.string() }))
        .query(async ({ ctx, input }) => {
        const projects = await ctx.db.query.userProjects.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.userProjects.userId, input.userId),
            with: {
                project: true,
            },
        });
        return projects.map((project) => (0, db_1.fromDbProject)(project.project));
    }),
    update: trpc_1.protectedProcedure.input(db_1.projectUpdateSchema).mutation(async ({ ctx, input }) => {
        await (0, helper_1.verifyProjectAccess)(ctx.db, ctx.user.id, input.id);
        const [updatedProject] = await ctx.db.update(db_1.projects).set({
            ...input,
            updatedAt: new Date(),
        }).where((0, drizzle_orm_1.eq)(db_1.projects.id, input.id)).returning();
        if (!updatedProject) {
            throw new Error('Project not found');
        }
        return (0, db_1.fromDbProject)(updatedProject);
    }),
    addTag: trpc_1.protectedProcedure.input(zod_1.z.object({
        projectId: zod_1.z.string(),
        tag: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        await (0, helper_1.verifyProjectAccess)(ctx.db, ctx.user.id, input.projectId);
        const project = await ctx.db.query.projects.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.projects.id, input.projectId),
        });
        if (!project) {
            throw new Error('Project not found');
        }
        const currentTags = project.tags ?? [];
        const newTags = currentTags.includes(input.tag)
            ? currentTags
            : [...currentTags, input.tag];
        await ctx.db.update(db_1.projects).set({
            tags: newTags,
            updatedAt: new Date(),
        }).where((0, drizzle_orm_1.eq)(db_1.projects.id, input.projectId));
        return { success: true, tags: newTags };
    }),
    removeTag: trpc_1.protectedProcedure.input(zod_1.z.object({
        projectId: zod_1.z.string(),
        tag: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        await (0, helper_1.verifyProjectAccess)(ctx.db, ctx.user.id, input.projectId);
        const project = await ctx.db.query.projects.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.projects.id, input.projectId),
        });
        if (!project) {
            throw new Error('Project not found');
        }
        const currentTags = project.tags ?? [];
        const newTags = currentTags.filter(tag => tag !== input.tag);
        await ctx.db.update(db_1.projects).set({
            tags: newTags,
            updatedAt: new Date(),
        }).where((0, drizzle_orm_1.eq)(db_1.projects.id, input.projectId));
        return { success: true, tags: newTags };
    }),
});
//# sourceMappingURL=project.js.map