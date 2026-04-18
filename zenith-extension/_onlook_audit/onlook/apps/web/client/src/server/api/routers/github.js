"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubRouter = void 0;
const db_1 = require("@onlook/db");
const github_1 = require("@onlook/github");
const server_1 = require("@trpc/server");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const getUserGitHubInstallation = async (db, userId) => {
    const user = await db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(db_1.users.id, userId),
        columns: { githubInstallationId: true }
    });
    if (!user?.githubInstallationId) {
        throw new server_1.TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'GitHub App installation required',
        });
    }
    return {
        octokit: (0, github_1.createInstallationOctokit)(user.githubInstallationId),
        installationId: user.githubInstallationId
    };
};
exports.githubRouter = (0, trpc_1.createTRPCRouter)({
    validate: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        owner: zod_1.z.string(),
        repo: zod_1.z.string()
    }))
        .mutation(async ({ input, ctx }) => {
        const { octokit } = await getUserGitHubInstallation(ctx.db, ctx.user.id);
        const { data } = await octokit.rest.repos.get({ owner: input.owner, repo: input.repo });
        return {
            branch: data.default_branch,
            isPrivateRepo: data.private
        };
    }),
    getRepo: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        owner: zod_1.z.string(),
        repo: zod_1.z.string()
    }))
        .query(async ({ input, ctx }) => {
        const { octokit } = await getUserGitHubInstallation(ctx.db, ctx.user.id);
        const { data } = await octokit.rest.repos.get({
            owner: input.owner,
            repo: input.repo
        });
        return data;
    }),
    getOrganizations: trpc_1.protectedProcedure
        .query(async ({ ctx }) => {
        try {
            const { octokit, installationId } = await getUserGitHubInstallation(ctx.db, ctx.user.id);
            // Get installation details to determine account type
            const installation = await octokit.rest.apps.getInstallation({
                installation_id: parseInt(installationId, 10),
            });
            // If installed on an organization, return that organization
            if (installation.data.account && 'type' in installation.data.account && installation.data.account.type === 'Organization') {
                return [{
                        id: installation.data.account.id,
                        login: 'login' in installation.data.account ? installation.data.account.login : installation.data.account.name || '',
                        avatar_url: installation.data.account.avatar_url,
                        description: undefined, // Organizations don't have descriptions in this context
                    }];
            }
            // If installed on a user account, return empty (no organizations)
            return [];
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'GitHub App installation is invalid or has been revoked',
                cause: error
            });
        }
    }),
    getRepoFiles: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        owner: zod_1.z.string(),
        repo: zod_1.z.string(),
        path: zod_1.z.string().default(''),
        ref: zod_1.z.string().optional() // branch, tag, or commit SHA
    }))
        .query(async ({ input, ctx }) => {
        const { octokit } = await getUserGitHubInstallation(ctx.db, ctx.user.id);
        const { data } = await octokit.rest.repos.getContent({
            owner: input.owner,
            repo: input.repo,
            path: input.path,
            ...(input.ref && { ref: input.ref })
        });
        return data;
    }),
    generateInstallationUrl: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        redirectUrl: zod_1.z.string().optional(),
    }).optional())
        .mutation(async ({ input, ctx }) => {
        const { url, state } = (0, github_1.generateInstallationUrl)({
            redirectUrl: input?.redirectUrl,
            state: ctx.user.id, // Use user ID as state for CSRF protection
        });
        return { url, state };
    }),
    checkGitHubAppInstallation: trpc_1.protectedProcedure
        .query(async ({ ctx }) => {
        try {
            const { octokit, installationId } = await getUserGitHubInstallation(ctx.db, ctx.user.id);
            await octokit.rest.apps.getInstallation({
                installation_id: parseInt(installationId, 10),
            });
            return installationId;
        }
        catch (error) {
            console.error('Error checking GitHub App installation:', error);
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: error instanceof Error ? error.message : 'GitHub App installation is invalid or has been revoked',
                cause: error
            });
        }
    }),
    // Repository fetching using GitHub App installation (required)
    getRepositoriesWithApp: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        username: zod_1.z.string().optional(),
    }).optional())
        .query(async ({ ctx }) => {
        try {
            const { octokit, installationId } = await getUserGitHubInstallation(ctx.db, ctx.user.id);
            const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
                installation_id: parseInt(installationId, 10),
                per_page: 100,
                page: 1,
            });
            // Transform to match reference implementation pattern
            return data.repositories.map(repo => ({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                description: repo.description,
                private: repo.private,
                default_branch: repo.default_branch,
                clone_url: repo.clone_url,
                html_url: repo.html_url,
                updated_at: repo.updated_at,
                owner: {
                    login: repo.owner.login,
                    avatar_url: repo.owner.avatar_url,
                },
            }));
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'GitHub App installation is invalid or has been revoked. Please reinstall the GitHub App.',
                cause: error
            });
        }
    }),
    handleInstallationCallbackUrl: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        installationId: zod_1.z.string(),
        setupAction: zod_1.z.string(),
        state: zod_1.z.string(),
    }))
        .mutation(async ({ input, ctx }) => {
        // Validate state parameter matches current user ID for CSRF protection
        if (input.state && input.state !== ctx.user.id) {
            console.error('State mismatch:', { expected: ctx.user.id, received: input.state });
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid state parameter',
            });
        }
        // Update user's GitHub installation ID
        try {
            await ctx.db.update(db_1.users)
                .set({ githubInstallationId: input.installationId })
                .where((0, drizzle_orm_1.eq)(db_1.users.id, ctx.user.id));
            console.log(`Updated installation ID for user: ${ctx.user.id}`);
            return {
                success: true,
                message: 'GitHub App installation completed successfully',
                installationId: input.installationId,
            };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update GitHub installation',
                cause: error,
            });
        }
    }),
});
//# sourceMappingURL=github.js.map