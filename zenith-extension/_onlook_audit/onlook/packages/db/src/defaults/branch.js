"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultBranch = void 0;
const uuid_1 = require("uuid");
const createDefaultBranch = ({ projectId, sandboxId, overrides = {}, }) => {
    return {
        id: (0, uuid_1.v4)(),
        projectId,
        name: 'main',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Main branch',
        gitBranch: null,
        gitCommitSha: null,
        gitRepoUrl: null,
        sandboxId,
        ...overrides,
    };
};
exports.createDefaultBranch = createDefaultBranch;
//# sourceMappingURL=branch.js.map