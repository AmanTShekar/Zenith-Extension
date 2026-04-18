"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectInvitationRelations = exports.projectInvitationUpdateSchema = exports.projectInvitationInsertSchema = exports.projectInvitations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const user_1 = require("../user");
const project_1 = require("./project");
exports.projectInvitations = (0, pg_core_1.pgTable)('project_invitations', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)('project_id')
        .notNull()
        .references(() => project_1.projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    inviterId: (0, pg_core_1.uuid)('inviter_id')
        .notNull()
        .references(() => user_1.users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    inviteeEmail: (0, pg_core_1.varchar)('invitee_email').notNull(),
    token: (0, pg_core_1.varchar)('token').notNull().unique(),
    role: (0, user_1.projectRole)('role').notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)('project_invitations_invitee_email_project_id_idx').on(table.inviteeEmail, table.projectId),
]).enableRLS();
exports.projectInvitationInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.projectInvitations);
exports.projectInvitationUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.projectInvitations);
exports.projectInvitationRelations = (0, drizzle_orm_1.relations)(exports.projectInvitations, ({ one }) => ({
    project: one(project_1.projects, {
        fields: [exports.projectInvitations.projectId],
        references: [project_1.projects.id],
    }),
    inviter: one(user_1.users, {
        fields: [exports.projectInvitations.inviterId],
        references: [user_1.users.id],
    }),
}));
//# sourceMappingURL=invitation.js.map