"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationRouter = void 0;
const env_1 = require("@/env");
const db_1 = require("@onlook/db");
const email_1 = require("@onlook/email");
const utility_1 = require("@onlook/utility");
const server_1 = require("@trpc/server");
const date_fns_1 = require("date-fns");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.invitationRouter = (0, trpc_1.createTRPCRouter)({
    get: trpc_1.protectedProcedure.input(zod_1.z.object({ id: zod_1.z.string() })).query(async ({ ctx, input }) => {
        const invitation = await ctx.db.query.projectInvitations.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.projectInvitations.id, input.id),
            with: {
                inviter: true,
            },
        });
        if (!invitation) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Invitation not found',
            });
        }
        if (!invitation.inviter) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Inviter not found',
            });
        }
        return {
            ...invitation,
            // @ts-expect-error - Drizzle is not typed correctly
            inviter: (0, db_1.fromDbUser)(invitation.inviter),
        };
    }),
    getWithoutToken: trpc_1.protectedProcedure.input(zod_1.z.object({ id: zod_1.z.string() })).query(async ({ ctx, input }) => {
        const invitation = await ctx.db.query.projectInvitations.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.projectInvitations.id, input.id),
            with: {
                inviter: true,
            },
        });
        if (!invitation) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Invitation not found',
            });
        }
        if (!invitation.inviter) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Inviter not found',
            });
        }
        return {
            ...invitation,
            token: null,
            // @ts-expect-error - Drizzle is not typed correctly
            inviter: (0, db_1.fromDbUser)(invitation.inviter),
        };
    }),
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
    }))
        .query(async ({ ctx, input }) => {
        const invitations = await ctx.db.query.projectInvitations.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.projectInvitations.projectId, input.projectId),
        });
        return invitations;
    }),
    create: trpc_1.protectedProcedure
        .input(db_1.projectInvitationInsertSchema.pick({
        projectId: true,
        inviteeEmail: true,
        role: true,
    }))
        .mutation(async ({ ctx, input }) => {
        if (!ctx.user.id) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'You must be logged in to invite a user',
            });
        }
        const inviter = await ctx.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.users.id, ctx.user.id),
        });
        if (!inviter) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Inviter not found',
            });
        }
        const [invitation] = await ctx.db
            .transaction(async (tx) => {
            const existingUser = await tx
                .select()
                .from(db_1.userProjects)
                .innerJoin(db_1.authUsers, (0, drizzle_orm_1.eq)(db_1.authUsers.id, db_1.userProjects.userId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.userProjects.projectId, input.projectId), (0, drizzle_orm_1.eq)(db_1.authUsers.email, input.inviteeEmail)))
                .limit(1);
            if (existingUser.length > 0) {
                throw new server_1.TRPCError({
                    code: 'CONFLICT',
                    message: 'User is already a member of the project',
                });
            }
            return await tx
                .insert(db_1.projectInvitations)
                .values([
                {
                    ...input,
                    role: input.role,
                    token: (0, uuid_1.v4)(),
                    inviterId: ctx.user.id,
                    expiresAt: (0, date_fns_1.addDays)(new Date(), 7),
                },
            ])
                .returning();
        });
        if (invitation) {
            if (!env_1.env.RESEND_API_KEY) {
                throw new server_1.TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'RESEND_API_KEY is not set, cannot send email',
                });
            }
            const emailClient = (0, email_1.getResendClient)({
                apiKey: env_1.env.RESEND_API_KEY,
            });
            const result = await (0, email_1.sendInvitationEmail)(emailClient, {
                inviteeEmail: input.inviteeEmail,
                invitedByName: inviter.firstName ?? inviter.displayName ?? undefined,
                invitedByEmail: ctx.user.email,
                inviteLink: (0, email_1.constructInvitationLink)(env_1.env.NEXT_PUBLIC_SITE_URL, invitation.id, invitation.token),
            }, {
                dryRun: env_1.env.NODE_ENV !== 'production',
            });
        }
        return invitation;
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.delete(db_1.projectInvitations).where((0, drizzle_orm_1.eq)(db_1.projectInvitations.id, input.id));
        return true;
    }),
    accept: trpc_1.protectedProcedure
        .input(zod_1.z.object({ token: zod_1.z.string(), id: zod_1.z.string() }))
        .mutation(async ({ ctx, input }) => {
        if (!ctx.user.id) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'You must be logged in to accept an invitation',
            });
        }
        const invitation = await ctx.db.query.projectInvitations.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.projectInvitations.id, input.id), (0, drizzle_orm_1.eq)(db_1.projectInvitations.token, input.token)),
            with: {
                project: {
                    with: {
                        canvas: true,
                    },
                },
            },
        });
        if (!invitation) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invitation does not exist',
            });
        }
        if (invitation.inviteeEmail !== ctx.user.email) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: `This invitation was sent to ${invitation.inviteeEmail}. Please sign in with that email address.`,
            });
        }
        if ((0, date_fns_1.isAfter)(new Date(), invitation.expiresAt)) {
            if (invitation) {
                await ctx.db
                    .delete(db_1.projectInvitations)
                    .where((0, drizzle_orm_1.eq)(db_1.projectInvitations.id, invitation.id));
            }
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invitation has expired',
            });
        }
        await ctx.db.transaction(async (tx) => {
            await tx.delete(db_1.projectInvitations).where((0, drizzle_orm_1.eq)(db_1.projectInvitations.id, invitation.id));
            await tx
                .insert(db_1.userProjects)
                .values({
                projectId: invitation.projectId,
                userId: ctx.user.id,
                role: invitation.role,
            })
                .onConflictDoNothing();
            await tx
                .insert(db_1.userCanvases)
                .values((0, db_1.createDefaultUserCanvas)(ctx.user.id, invitation.project.canvas.id))
                .onConflictDoNothing();
        });
    }),
    suggested: trpc_1.protectedProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string() }))
        .query(async ({ ctx, input }) => {
        if ((0, utility_1.isFreeEmail)(ctx.user.email)) {
            return [];
        }
        const domain = ctx.user.email.split('@').at(-1);
        const suggestedUsers = await ctx.db
            .select()
            .from(db_1.authUsers)
            .leftJoin(db_1.userProjects, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.userProjects.userId, db_1.authUsers.id), (0, drizzle_orm_1.eq)(db_1.userProjects.projectId, input.projectId)))
            .leftJoin(db_1.projectInvitations, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.projectInvitations.inviteeEmail, db_1.authUsers.email), (0, drizzle_orm_1.eq)(db_1.projectInvitations.projectId, input.projectId)))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.ilike)(db_1.authUsers.email, `%@${domain}`), (0, drizzle_orm_1.isNull)(db_1.userProjects.userId), // Not in the project
        (0, drizzle_orm_1.isNull)(db_1.projectInvitations.id)))
            .limit(5);
        return suggestedUsers.map((user) => user.users.email);
    }),
});
//# sourceMappingURL=invitation.js.map