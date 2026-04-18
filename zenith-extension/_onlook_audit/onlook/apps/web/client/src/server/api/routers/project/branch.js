"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchRouter = void 0;
const code_provider_1 = require("@onlook/code-provider");
const constants_1 = require("@onlook/constants");
const db_1 = require("@onlook/db");
const utility_1 = require("@onlook/utility");
const server_1 = require("@trpc/server");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
const helper_1 = require("./helper");
// Helper function to get existing frames in a canvas
async function getExistingFrames(tx, canvasId) {
    const dbFrames = await tx.query.frames.findMany({
        where: (0, drizzle_orm_1.eq)(db_1.frames.canvasId, canvasId),
    });
    return dbFrames.map(db_1.fromDbFrame);
}
exports.branchRouter = (0, trpc_1.createTRPCRouter)({
    getByProjectId: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
        onlyDefault: zod_1.z.boolean().optional(),
    }))
        .query(async ({ ctx, input }) => {
        const dbBranches = await ctx.db.query.branches.findMany({
            where: input.onlyDefault ?
                (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.branches.isDefault, true), (0, drizzle_orm_1.eq)(db_1.branches.projectId, input.projectId)) :
                (0, drizzle_orm_1.eq)(db_1.branches.projectId, input.projectId),
        });
        // TODO: Create a default branch if none exists for backwards compatibility
        if (!dbBranches || dbBranches.length === 0) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Branches not found',
            });
        }
        return dbBranches.map(db_1.fromDbBranch);
    }),
    create: trpc_1.protectedProcedure
        .input(db_1.branchInsertSchema)
        .mutation(async ({ ctx, input }) => {
        try {
            await ctx.db.insert(db_1.branches).values(input);
            return true;
        }
        catch (error) {
            console.error('Error creating branch', error);
            return false;
        }
    }),
    update: trpc_1.protectedProcedure.input(db_1.branchUpdateSchema).mutation(async ({ ctx, input }) => {
        try {
            await ctx.db
                .update(db_1.branches)
                .set({ ...input, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(db_1.branches.id, input.id));
            return true;
        }
        catch (error) {
            console.error('Error updating branch', error);
            return false;
        }
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        branchId: zod_1.z.string().uuid(),
    }))
        .mutation(async ({ ctx, input }) => {
        try {
            await ctx.db.delete(db_1.branches).where((0, drizzle_orm_1.eq)(db_1.branches.id, input.branchId));
            return true;
        }
        catch (error) {
            console.error('Error deleting branch', error);
            return false;
        }
    }),
    fork: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        branchId: zod_1.z.uuid(),
    }))
        .mutation(async ({ ctx, input }) => {
        try {
            // Get source branch with its frames to extract port
            const sourceBranch = await ctx.db.query.branches.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.branches.id, input.branchId),
                with: {
                    frames: true,
                },
            });
            if (!sourceBranch) {
                throw new server_1.TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Source branch not found',
                });
            }
            // Get existing branch names for unique name generation
            const existingBranches = await ctx.db.query.branches.findMany({
                where: (0, drizzle_orm_1.eq)(db_1.branches.projectId, sourceBranch.projectId),
            });
            const existingNames = existingBranches.map(branch => branch.name);
            // Generate unique branch name
            const branchName = (0, utility_1.generateUniqueBranchName)(sourceBranch.name, existingNames);
            // Fork the sandbox using code provider
            const CodesandboxProvider = await (0, code_provider_1.getStaticCodeProvider)(code_provider_1.CodeProvider.CodeSandbox);
            const forkedSandbox = await CodesandboxProvider.createProject({
                source: 'template',
                id: sourceBranch.sandboxId,
                title: branchName,
                tags: ['fork'],
            });
            const sandboxId = forkedSandbox.id;
            // Extract port from source branch frames or fall back to 3000
            const port = (0, helper_1.extractCsbPort)(sourceBranch.frames) ?? 3000;
            const previewUrl = (0, constants_1.getSandboxPreviewUrl)(sandboxId, port);
            // Create new branch
            const newBranchId = (0, uuid_1.v4)();
            const newBranch = {
                id: newBranchId,
                name: branchName,
                description: null,
                projectId: sourceBranch.projectId,
                sandboxId,
                isDefault: false,
                gitBranch: null,
                gitCommitSha: null,
                gitRepoUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            return await ctx.db.transaction(async (tx) => {
                await tx.insert(db_1.branches).values(newBranch);
                // Always create at least one frame using the target branch's frame data
                let createdFrames = [];
                // Get the canvas for the project
                const canvas = await tx.query.canvases.findFirst({
                    where: (0, drizzle_orm_1.eq)(db_1.canvases.projectId, sourceBranch.projectId),
                });
                if (canvas) {
                    // Get existing frames for smart positioning
                    const existingFrames = await getExistingFrames(tx, canvas.id);
                    // Use the first frame from the source branch as reference, or default dimensions
                    let frameWidth = 1200;
                    let frameHeight = 800;
                    let baseX = 100;
                    let baseY = 100;
                    if (sourceBranch.frames && sourceBranch.frames.length > 0 && sourceBranch.frames[0]) {
                        const sourceFrame = sourceBranch.frames[0];
                        frameWidth = parseInt(sourceFrame.width) || frameWidth;
                        frameHeight = parseInt(sourceFrame.height) || frameHeight;
                        baseX = parseInt(sourceFrame.x) || baseX;
                        baseY = parseInt(sourceFrame.y) || baseY;
                    }
                    // Create a proposed frame based on source frame dimensions
                    const proposedFrame = {
                        id: (0, uuid_1.v4)(),
                        branchId: newBranchId,
                        canvasId: canvas.id,
                        position: {
                            x: baseX + frameWidth + 100, // Initial offset to the right
                            y: baseY,
                        },
                        dimension: {
                            width: frameWidth,
                            height: frameHeight,
                        },
                        url: previewUrl,
                    };
                    // Calculate non-overlapping position
                    const optimalPosition = (0, utility_1.calculateNonOverlappingPosition)(proposedFrame, existingFrames);
                    const newFrame = (0, db_1.createDefaultFrame)({
                        canvasId: canvas.id,
                        branchId: newBranchId,
                        url: previewUrl,
                        overrides: {
                            x: optimalPosition.x.toString(),
                            y: optimalPosition.y.toString(),
                            width: frameWidth.toString(),
                            height: frameHeight.toString(),
                        },
                    });
                    await tx.insert(db_1.frames).values(newFrame);
                    createdFrames.push((0, db_1.fromDbFrame)(newFrame));
                }
                return {
                    branch: (0, db_1.fromDbBranch)(newBranch),
                    frames: createdFrames,
                    sandboxId,
                    previewUrl,
                };
            });
        }
        catch (error) {
            console.error('Error forking branch', error);
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fork branch',
            });
        }
    }),
    createBlank: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
        branchName: zod_1.z.string().optional(),
        framePosition: zod_1.z.object({
            x: zod_1.z.number(),
            y: zod_1.z.number(),
            width: zod_1.z.number(),
            height: zod_1.z.number(),
        }).optional(),
    }))
        .mutation(async ({ ctx, input }) => {
        try {
            return await ctx.db.transaction(async (tx) => {
                // Get existing branches with frames for unique name generation and port extraction
                const existingBranches = await tx.query.branches.findMany({
                    where: (0, drizzle_orm_1.eq)(db_1.branches.projectId, input.projectId),
                    with: {
                        frames: true,
                    },
                });
                const existingNames = existingBranches.map(branch => branch.name);
                // Generate unique branch name if not provided
                const baseName = 'empty';
                let branchName;
                if (input.branchName) {
                    branchName = input.branchName;
                }
                else {
                    branchName = (0, utility_1.generateUniqueBranchName)(baseName, existingNames);
                }
                // Create new blank sandbox
                const CodesandboxProvider = await (0, code_provider_1.getStaticCodeProvider)(code_provider_1.CodeProvider.CodeSandbox);
                const blankSandbox = await CodesandboxProvider.createProject({
                    source: 'template',
                    id: constants_1.SandboxTemplates[constants_1.Templates.EMPTY_NEXTJS].id,
                    title: branchName,
                    tags: ['blank'],
                });
                const sandboxId = blankSandbox.id;
                // Extract port from existing project frames or fall back to 3000
                const allFrames = existingBranches.flatMap(branch => branch.frames || []);
                const port = (0, helper_1.extractCsbPort)(allFrames) ?? 3000;
                const previewUrl = (0, constants_1.getSandboxPreviewUrl)(sandboxId, port);
                // Create new branch
                const newBranchId = (0, uuid_1.v4)();
                const newBranch = {
                    id: newBranchId,
                    name: branchName,
                    description: null,
                    projectId: input.projectId,
                    sandboxId,
                    isDefault: false,
                    gitBranch: null,
                    gitCommitSha: null,
                    gitRepoUrl: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                await tx.insert(db_1.branches).values(newBranch);
                // Create new frame if position is provided
                let createdFrames = [];
                if (input.framePosition) {
                    // Get the canvas for the project
                    const canvas = await tx.query.canvases.findFirst({
                        where: (0, drizzle_orm_1.eq)(db_1.canvases.projectId, input.projectId),
                    });
                    if (canvas) {
                        // Get existing frames for smart positioning
                        const existingFrames = await getExistingFrames(tx, canvas.id);
                        // Create a proposed frame based on input position
                        const proposedFrame = {
                            id: (0, uuid_1.v4)(),
                            branchId: newBranchId,
                            canvasId: canvas.id,
                            position: {
                                x: input.framePosition.x + input.framePosition.width + 100, // Initial simple offset
                                y: input.framePosition.y,
                            },
                            dimension: {
                                width: input.framePosition.width,
                                height: input.framePosition.height,
                            },
                            url: previewUrl,
                        };
                        // Calculate non-overlapping position
                        const optimalPosition = (0, utility_1.calculateNonOverlappingPosition)(proposedFrame, existingFrames);
                        const newFrame = (0, db_1.createDefaultFrame)({
                            canvasId: canvas.id,
                            branchId: newBranchId,
                            url: previewUrl,
                            overrides: {
                                x: optimalPosition.x.toString(),
                                y: optimalPosition.y.toString(),
                                width: input.framePosition.width.toString(),
                                height: input.framePosition.height.toString(),
                            },
                        });
                        await tx.insert(db_1.frames).values(newFrame);
                        createdFrames.push((0, db_1.fromDbFrame)(newFrame));
                    }
                }
                return {
                    branch: (0, db_1.fromDbBranch)(newBranch),
                    frames: createdFrames,
                    sandboxId,
                    previewUrl,
                };
            });
        }
        catch (error) {
            console.error('Error creating blank sandbox', error);
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error instanceof Error ? error.message : 'Failed to create blank sandbox',
            });
        }
    }),
});
//# sourceMappingURL=branch.js.map