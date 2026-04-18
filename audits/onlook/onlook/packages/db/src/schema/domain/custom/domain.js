"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customDomainRelations = exports.customDomains = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const project_custom_domain_1 = require("./project-custom-domain");
const verification_1 = require("./verification");
exports.customDomains = (0, pg_core_1.pgTable)('custom_domains', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    apexDomain: (0, pg_core_1.text)('apex_domain').notNull().unique(),
    verified: (0, pg_core_1.boolean)('verified').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
}).enableRLS();
exports.customDomainRelations = (0, drizzle_orm_1.relations)(exports.customDomains, ({ many }) => ({
    projectCustomDomains: many(project_custom_domain_1.projectCustomDomains),
    verificationRequests: many(verification_1.customDomainVerification),
}));
//# sourceMappingURL=domain.js.map