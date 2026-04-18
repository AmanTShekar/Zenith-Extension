"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const server_1 = require("@/utils/analytics/server");
const webhook_1 = require("@/utils/n8n/webhook");
const db_1 = require("@onlook/db");
const utility_1 = require("@onlook/utility");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
const user_settings_1 = require("./user-settings");
exports.userRouter = (0, trpc_1.createTRPCRouter)({
    get: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const authUser = ctx.user;
        const user = await ctx.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.users.id, authUser.id),
        });
        const { displayName, firstName, lastName } = getUserName(authUser);
        const userData = user ? (0, db_1.fromDbUser)({
            ...user,
            firstName: user.firstName ?? firstName,
            lastName: user.lastName ?? lastName,
            displayName: user.displayName ?? displayName,
            email: user.email ?? authUser.email,
            avatarUrl: user.avatarUrl ?? authUser.user_metadata.avatarUrl,
        }) : null;
        return userData;
    }),
    getById: trpc_1.protectedProcedure.input(zod_1.z.string()).query(async ({ ctx, input }) => {
        const user = await ctx.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.users.id, input),
            with: {
                userProjects: {
                    with: {
                        project: true,
                    },
                },
            },
        });
        return user;
    }),
    upsert: trpc_1.protectedProcedure
        .input(db_1.userInsertSchema)
        .mutation(async ({ ctx, input }) => {
        const authUser = ctx.user;
        const existingUser = await ctx.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.users.id, input.id),
        });
        const { firstName, lastName, displayName } = getUserName(authUser);
        const userData = {
            id: input.id,
            firstName: input.firstName ?? firstName,
            lastName: input.lastName ?? lastName,
            displayName: input.displayName ?? displayName,
            email: input.email ?? authUser.email,
            avatarUrl: input.avatarUrl ?? authUser.user_metadata.avatarUrl,
        };
        const [user] = await ctx.db
            .insert(db_1.users)
            .values(userData)
            .onConflictDoUpdate({
            target: [db_1.users.id],
            set: {
                ...userData,
                updatedAt: new Date(),
            },
        }).returning();
        if (!existingUser) {
            await (0, server_1.trackEvent)({
                distinctId: input.id,
                event: 'user_first_signup',
                properties: {
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    displayName: userData.displayName,
                    source: 'web beta',
                },
            });
            await (0, webhook_1.callUserWebhook)({
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                source: 'web beta',
                subscribed: false,
            });
        }
        return user ?? null;
    }),
    settings: user_settings_1.userSettingsRouter,
    delete: trpc_1.protectedProcedure.mutation(async ({ ctx }) => {
        await ctx.db.delete(db_1.authUsers).where((0, drizzle_orm_1.eq)(db_1.authUsers.id, ctx.user.id));
    }),
});
function getUserName(authUser) {
    const displayName = authUser.user_metadata.name ?? authUser.user_metadata.display_name ?? authUser.user_metadata.full_name ?? authUser.user_metadata.first_name ?? authUser.user_metadata.last_name ?? authUser.user_metadata.given_name ?? authUser.user_metadata.family_name;
    const { firstName, lastName } = (0, utility_1.extractNames)(displayName ?? '');
    return {
        displayName: displayName ?? '',
        firstName,
        lastName,
    };
}
//# sourceMappingURL=user.js.map