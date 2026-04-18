"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customDomainVerificationRelations = exports.customDomainVerification = exports.verificationRequestStatus = void 0;
const models_1 = require("@onlook/models");
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const project_1 = require("../../project");
const domain_1 = require("./domain");
exports.verificationRequestStatus = (0, pg_core_1.pgEnum)('verification_request_status', models_1.VerificationRequestStatus);
exports.customDomainVerification = (0, pg_core_1.pgTable)('custom_domain_verification', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    customDomainId: (0, pg_core_1.uuid)('custom_domain_id').references(() => domain_1.customDomains.id).notNull(),
    projectId: (0, pg_core_1.uuid)('project_id').references(() => project_1.projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
    fullDomain: (0, pg_core_1.text)('full_domain').notNull(),
    freestyleVerificationId: (0, pg_core_1.text)('freestyle_verification_id').notNull(),
    txtRecord: (0, pg_core_1.jsonb)('txt_record').notNull().$type(),
    aRecords: (0, pg_core_1.jsonb)('a_records').notNull().$type().default([]),
    status: (0, exports.verificationRequestStatus)('status').default(models_1.VerificationRequestStatus.PENDING).notNull(),
}).enableRLS();
exports.customDomainVerificationRelations = (0, drizzle_orm_1.relations)(exports.customDomainVerification, ({ one }) => ({
    customDomain: one(domain_1.customDomains, {
        fields: [exports.customDomainVerification.customDomainId],
        references: [domain_1.customDomains.id],
    }),
}));
//# sourceMappingURL=verification.js.map