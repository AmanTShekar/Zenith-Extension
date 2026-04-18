"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sandboxRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const code_provider_1 = require("@onlook/code-provider");
const constants_1 = require("@onlook/constants");
const id_1 = require("@onlook/utility/src/id");
const trpc_1 = require("../../trpc");
function getProvider({ sandboxId, userId, provider = code_provider_1.CodeProvider.CodeSandbox, }) {
    if (provider === code_provider_1.CodeProvider.CodeSandbox) {
        return (0, code_provider_1.createCodeProviderClient)(code_provider_1.CodeProvider.CodeSandbox, {
            providerOptions: {
                codesandbox: {
                    sandboxId,
                    userId,
                },
            },
        });
    }
    else {
        return (0, code_provider_1.createCodeProviderClient)(code_provider_1.CodeProvider.NodeFs, {
            providerOptions: {
                nodefs: {},
            },
        });
    }
}
exports.sandboxRouter = (0, trpc_1.createTRPCRouter)({
    create: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string().optional(),
    }))
        .mutation(async ({ input, ctx }) => {
        // Create a new sandbox using the static provider
        const CodesandboxProvider = await (0, code_provider_1.getStaticCodeProvider)(code_provider_1.CodeProvider.CodeSandbox);
        // Use the empty Next.js template
        const template = constants_1.SandboxTemplates[constants_1.Templates.EMPTY_NEXTJS];
        const newSandbox = await CodesandboxProvider.createProject({
            source: 'template',
            id: template.id,
            title: input.title || 'Onlook Test Sandbox',
            description: 'Test sandbox for Onlook sync engine',
            tags: ['onlook-test'],
        });
        return {
            sandboxId: newSandbox.id,
            previewUrl: (0, constants_1.getSandboxPreviewUrl)(newSandbox.id, template.port),
        };
    }),
    start: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sandboxId: zod_1.z.string(),
    }))
        .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.id;
        const provider = await getProvider({
            sandboxId: input.sandboxId,
            userId,
        });
        const session = await provider.createSession({
            args: {
                id: (0, id_1.shortenUuid)(userId, 20),
            },
        });
        await provider.destroy();
        return session;
    }),
    hibernate: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sandboxId: zod_1.z.string(),
    }))
        .mutation(async ({ input }) => {
        const provider = await getProvider({ sandboxId: input.sandboxId });
        try {
            await provider.pauseProject({});
        }
        finally {
            await provider.destroy().catch(() => { });
        }
    }),
    list: trpc_1.protectedProcedure.input(zod_1.z.object({ sandboxId: zod_1.z.string() })).query(async ({ input }) => {
        const provider = await getProvider({ sandboxId: input.sandboxId });
        const res = await provider.listProjects({});
        // TODO future iteration of code provider abstraction will need this code to be refactored
        if ('projects' in res) {
            return res.projects;
        }
        return [];
    }),
    fork: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sandbox: zod_1.z.object({
            id: zod_1.z.string(),
            port: zod_1.z.number(),
        }),
        config: zod_1.z
            .object({
            title: zod_1.z.string().optional(),
            tags: zod_1.z.array(zod_1.z.string()).optional(),
        })
            .optional(),
    }))
        .mutation(async ({ input }) => {
        const MAX_RETRY_ATTEMPTS = 3;
        let lastError = null;
        for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                const CodesandboxProvider = await (0, code_provider_1.getStaticCodeProvider)(code_provider_1.CodeProvider.CodeSandbox);
                const sandbox = await CodesandboxProvider.createProject({
                    source: 'template',
                    id: input.sandbox.id,
                    // Metadata
                    title: input.config?.title,
                    tags: input.config?.tags,
                });
                const previewUrl = (0, constants_1.getSandboxPreviewUrl)(sandbox.id, input.sandbox.port);
                return {
                    sandboxId: sandbox.id,
                    previewUrl,
                };
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt < MAX_RETRY_ATTEMPTS) {
                    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        throw new server_1.TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create sandbox after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`,
            cause: lastError,
        });
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sandboxId: zod_1.z.string(),
    }))
        .mutation(async ({ input }) => {
        const provider = await getProvider({ sandboxId: input.sandboxId });
        try {
            await provider.stopProject({});
        }
        finally {
            await provider.destroy().catch(() => { });
        }
    }),
    createFromGitHub: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        repoUrl: zod_1.z.string(),
        branch: zod_1.z.string(),
    }))
        .mutation(async ({ input }) => {
        const MAX_RETRY_ATTEMPTS = 3;
        const DEFAULT_PORT = 3000;
        let lastError = null;
        for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                const CodesandboxProvider = await (0, code_provider_1.getStaticCodeProvider)(code_provider_1.CodeProvider.CodeSandbox);
                const sandbox = await CodesandboxProvider.createProjectFromGit({
                    repoUrl: input.repoUrl,
                    branch: input.branch,
                });
                const previewUrl = (0, constants_1.getSandboxPreviewUrl)(sandbox.id, DEFAULT_PORT);
                return {
                    sandboxId: sandbox.id,
                    previewUrl,
                };
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt < MAX_RETRY_ATTEMPTS) {
                    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        throw new server_1.TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create GitHub sandbox after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`,
            cause: lastError,
        });
    }),
});
//# sourceMappingURL=sandbox.js.map