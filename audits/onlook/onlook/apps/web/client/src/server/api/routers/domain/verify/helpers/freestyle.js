"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFreestyleDomainWithCustomDomain = exports.verifyFreestyleDomain = exports.createDomainVerification = void 0;
const constants_1 = require("@onlook/constants");
const db_1 = require("@onlook/db");
const server_1 = require("@trpc/server");
const freestyle_1 = require("../../freestyle");
const records_1 = require("./records");
const createDomainVerification = async (db, domain, projectId, customDomainId, subdomain) => {
    const sdk = (0, freestyle_1.initializeFreestyleSdk)();
    const { id: freestyleVerificationId, verificationCode } = await sdk.createDomainVerificationRequest(domain);
    const [verification] = await db.insert(db_1.customDomainVerification).values({
        customDomainId,
        fullDomain: domain,
        projectId,
        freestyleVerificationId,
        txtRecord: {
            type: 'TXT',
            name: constants_1.FREESTYLE_CUSTOM_HOSTNAME,
            value: verificationCode,
            verified: false,
        },
        aRecords: (0, records_1.getARecords)(subdomain),
    }).returning();
    if (!verification) {
        throw new server_1.TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create domain verification',
        });
    }
    return verification;
};
exports.createDomainVerification = createDomainVerification;
const verifyFreestyleDomain = async (verificationId) => {
    try {
        const sdk = (0, freestyle_1.initializeFreestyleSdk)();
        const res = await sdk.verifyDomainVerificationRequest(verificationId);
        if (!res.domain) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to verify domain',
            });
        }
        return res.domain;
    }
    catch (error) {
        console.error(error);
        return null;
    }
};
exports.verifyFreestyleDomain = verifyFreestyleDomain;
const verifyFreestyleDomainWithCustomDomain = async (domain) => {
    try {
        const sdk = (0, freestyle_1.initializeFreestyleSdk)();
        const res = await sdk.verifyDomain(domain);
        if (!res.domain) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: res.message ?? 'Failed to verify domain',
            });
        }
        const verifiedDomain = res.domain;
        if (!verifiedDomain) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Domain not found',
            });
        }
        return verifiedDomain;
    }
    catch (error) {
        console.error(error);
        return null;
    }
};
exports.verifyFreestyleDomainWithCustomDomain = verifyFreestyleDomainWithCustomDomain;
//# sourceMappingURL=freestyle.js.map