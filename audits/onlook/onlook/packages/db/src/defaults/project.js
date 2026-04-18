"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultProject = void 0;
const uuid_1 = require("uuid");
const createDefaultProject = ({ overrides = {}, }) => {
    return {
        id: (0, uuid_1.v4)(),
        name: 'New Project',
        description: 'Your new project',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        previewImgUrl: null,
        previewImgPath: null,
        previewImgBucket: null,
        updatedPreviewImgAt: null,
        ...overrides,
        // deprecated
        sandboxId: null,
        sandboxUrl: null,
    };
};
exports.createDefaultProject = createDefaultProject;
//# sourceMappingURL=project.js.map