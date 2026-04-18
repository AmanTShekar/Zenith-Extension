"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromDbUser = exports.toDbUser = void 0;
const toDbUser = (user) => {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stripeCustomerId: user.stripeCustomerId,
        githubInstallationId: user.githubInstallationId,
    };
};
exports.toDbUser = toDbUser;
const fromDbUser = (user) => {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stripeCustomerId: user.stripeCustomerId,
        githubInstallationId: user.githubInstallationId,
    };
};
exports.fromDbUser = fromDbUser;
//# sourceMappingURL=user.js.map