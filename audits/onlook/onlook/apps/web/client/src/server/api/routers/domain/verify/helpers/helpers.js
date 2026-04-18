"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerification = exports.getCustomDomain = exports.ensureUserOwnsDomain = void 0;
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const server_1 = require("@trpc/server");
const drizzle_orm_1 = require("drizzle-orm");
const tldts_1 = require("tldts");
const ensureUserOwnsDomain = async (db, userId, domain) => {
    const foundUserProjects = await db.query.userProjects.findMany({
        where: (0, drizzle_orm_1.eq)(db_1.userProjects.userId, userId),
        with: {
            project: {
                with: {
                    projectCustomDomains: true,
                },
            }
        },
    });
    const ownedDomains = foundUserProjects.flatMap(userProject => userProject.project.projectCustomDomains.map(domain => domain.fullDomain));
    return ownedDomains.includes(domain);
};
exports.ensureUserOwnsDomain = ensureUserOwnsDomain;
const getCustomDomain = async (db, domain) => {
    const parsedDomain = (0, tldts_1.parse)(domain);
    if (!parsedDomain.domain) {
        throw new server_1.TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid domain format ${domain}`,
        });
    }
    if (!parsedDomain.domain) {
        throw new server_1.TRPCError({
            code: 'BAD_REQUEST',
            message: 'Could not resolve apex domain',
        });
    }
    const apexDomain = parsedDomain.domain;
    const subdomain = parsedDomain.subdomain;
    const [customDomain] = await db
        .insert(db_1.customDomains)
        .values({
        apexDomain,
    })
        .onConflictDoUpdate({
        target: db_1.customDomains.apexDomain,
        set: {
            updatedAt: new Date(),
        },
    })
        .returning();
    if (!customDomain) {
        throw new server_1.TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create or update domain',
        });
    }
    return { customDomain, subdomain };
};
exports.getCustomDomain = getCustomDomain;
const getVerification = async (db, projectId, customDomainId) => {
    const verification = await db.query.customDomainVerification.findFirst({
        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.customDomainVerification.customDomainId, customDomainId), (0, drizzle_orm_1.eq)(db_1.customDomainVerification.projectId, projectId), (0, drizzle_orm_1.eq)(db_1.customDomainVerification.status, models_1.VerificationRequestStatus.PENDING)),
    });
    return verification;
};
exports.getVerification = getVerification;
//# sourceMappingURL=helpers.js.map