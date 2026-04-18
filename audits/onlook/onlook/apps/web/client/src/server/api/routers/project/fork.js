"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fork = void 0;
const trpc_1 = require("@/server/api/trpc");
const server_1 = require("@/utils/analytics/server");
const code_provider_1 = require("@onlook/code-provider");
const constants_1 = require("@onlook/constants");
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const zod_1 = require("zod");
/**
 * Validates that the source project exists and has branches
 */
function validateSourceProject(sourceProject) {
    if (!sourceProject) {
        throw new Error('Source project not found');
    }
    if (!sourceProject.branches || sourceProject.branches.length === 0) {
        throw new Error('Source project has no branches');
    }
}
/**
 * Forks all branches and creates sandbox projects for each
 */
async function forkAllBranches(sourceBranches, sourceProjectName) {
    const CodesandboxProvider = await (0, code_provider_1.getStaticCodeProvider)(code_provider_1.CodeProvider.CodeSandbox);
    const branchMapping = new Map();
    for (const sourceBranch of sourceBranches) {
        if (!sourceBranch.sandboxId) {
            throw new Error(`Branch ${sourceBranch.name} has no sandbox ID`);
        }
        const newSandbox = await CodesandboxProvider.createProject({
            source: 'template',
            id: sourceBranch.sandboxId,
            title: `${sourceProjectName} (Fork) - ${sourceBranch.name}`,
            tags: ['template-fork'],
        });
        const newSandboxUrl = (0, constants_1.getSandboxPreviewUrl)(newSandbox.id, 3000);
        const newBranch = {
            ...sourceBranch,
            id: (0, uuid_1.v4)(),
            sandboxId: newSandbox.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        branchMapping.set(sourceBranch.id, {
            newBranch,
            newSandboxUrl,
        });
    }
    return branchMapping;
}
/**
 * Creates new project data from source project
 */
function createNewProjectData(sourceProject, customName) {
    return {
        name: customName || `${sourceProject.name} (Copy)`,
        description: sourceProject.description,
        tags: sourceProject.tags?.filter(tag => tag !== constants_1.Tags.TEMPLATE) ?? [],
        previewImgUrl: sourceProject.previewImgUrl,
        previewImgPath: sourceProject.previewImgPath,
        previewImgBucket: sourceProject.previewImgBucket,
        // Allows for the preview image to be updated
        updatedPreviewImgAt: null,
    };
}
/**
 * Creates frames mapped to their corresponding new branches, preserving original positions
 */
function createMappedFrames(sourceFrames, newCanvasId, branchMapping) {
    const newFrames = [];
    for (const frame of sourceFrames) {
        if (frame.branchId) {
            const branchMap = branchMapping.get(frame.branchId);
            if (branchMap) {
                newFrames.push({
                    ...frame,
                    id: (0, uuid_1.v4)(),
                    canvasId: newCanvasId,
                    branchId: branchMap.newBranch.id,
                    url: branchMap.newSandboxUrl,
                });
            }
        }
    }
    return newFrames;
}
/**
 * Creates default frames for the default branch
 */
function createDefaultFramesForDefaultBranch(canvasId, branchMapping) {
    const defaultBranchMap = Array.from(branchMapping.values())
        .find(({ newBranch }) => newBranch.isDefault);
    if (!defaultBranchMap) {
        return [];
    }
    const desktopFrame = (0, db_1.createDefaultFrame)({
        canvasId,
        branchId: defaultBranchMap.newBranch.id,
        url: defaultBranchMap.newSandboxUrl,
        type: db_1.DefaultFrameType.DESKTOP,
    });
    return [desktopFrame];
}
exports.fork = trpc_1.protectedProcedure
    .input(zod_1.z.object({
    projectId: zod_1.z.uuid(),
    name: zod_1.z.string().optional(),
}))
    .mutation(async ({ ctx, input }) => {
    // 1. Get the source project with canvas, frames, and branches
    const sourceProject = await ctx.db.query.projects.findFirst({
        where: (0, drizzle_orm_1.eq)(db_1.projects.id, input.projectId),
        with: {
            canvas: {
                with: {
                    frames: {
                        with: {
                            branch: true,
                        },
                    },
                    userCanvases: true,
                },
            },
            branches: true,
        },
    });
    validateSourceProject(sourceProject);
    // 2. Fork all branches and create sandbox projects
    const branchMapping = await forkAllBranches(sourceProject.branches, sourceProject.name);
    // 3. Create the new project with forked data
    const newProjectData = createNewProjectData(sourceProject, input.name);
    return await ctx.db.transaction(async (tx) => {
        // Create the new project
        const [newProject] = await tx.insert(db_1.projects).values(newProjectData).returning();
        if (!newProject) {
            throw new Error('Failed to create project in database');
        }
        // Create all branches for the new project
        const newBranches = Array.from(branchMapping.values()).map(({ newBranch }) => ({
            ...newBranch,
            projectId: newProject.id,
        }));
        await tx.insert(db_1.branches).values(newBranches);
        // Create the user-project association
        await tx.insert(db_1.userProjects).values({
            userId: ctx.user.id,
            projectId: newProject.id,
            role: models_1.ProjectRole.OWNER,
        });
        // Handle canvas and frames
        const sourceCanvas = sourceProject.canvas;
        if (sourceCanvas) {
            // Create new canvas
            const newCanvas = {
                id: (0, uuid_1.v4)(),
                projectId: newProject.id
            };
            await tx.insert(db_1.canvases).values(newCanvas);
            // Create user canvas with default positioning
            const newUserCanvas = (0, db_1.createDefaultUserCanvas)(ctx.user.id, newCanvas.id, {
                x: '120',
                y: '120',
                scale: '0.56',
            });
            await tx.insert(db_1.userCanvases).values(newUserCanvas);
            // Handle frames
            if (sourceCanvas.frames && sourceCanvas.frames.length > 0) {
                const newFrames = createMappedFrames(sourceCanvas.frames, newCanvas.id, branchMapping);
                if (newFrames.length > 0) {
                    await tx.insert(db_1.frames).values(newFrames);
                }
            }
            else {
                // Create default frames for default branch only
                const defaultFrames = createDefaultFramesForDefaultBranch(newCanvas.id, branchMapping);
                if (defaultFrames.length > 0) {
                    await tx.insert(db_1.frames).values(defaultFrames);
                }
            }
        }
        else {
            // Create default canvas and frames if source had none
            const newCanvas = (0, db_1.createDefaultCanvas)(newProject.id);
            await tx.insert(db_1.canvases).values(newCanvas);
            const newUserCanvas = (0, db_1.createDefaultUserCanvas)(ctx.user.id, newCanvas.id, {
                x: '120',
                y: '120',
                scale: '0.56',
            });
            await tx.insert(db_1.userCanvases).values(newUserCanvas);
            // Create default frames for the default branch
            const defaultFrames = createDefaultFramesForDefaultBranch(newCanvas.id, branchMapping);
            if (defaultFrames.length > 0) {
                await tx.insert(db_1.frames).values(defaultFrames);
            }
        }
        // Track the fork event
        const allSandboxIds = Array.from(branchMapping.values())
            .map(({ newBranch }) => newBranch.sandboxId);
        (0, server_1.trackEvent)({
            distinctId: ctx.user.id,
            event: 'user_fork_template',
            properties: {
                sourceProjectId: input.projectId,
                newProjectId: newProject.id,
                sandboxIds: allSandboxIds,
                branchCount: branchMapping.size,
            },
        });
        return newProject;
    });
});
//# sourceMappingURL=fork.js.map