"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDbProject = exports.fromDbProject = void 0;
exports.fromDbPreviewImg = fromDbPreviewImg;
exports.toDbPreviewImg = toDbPreviewImg;
const fromDbProject = (dbProject) => {
    return {
        id: dbProject.id,
        name: dbProject.name,
        metadata: {
            createdAt: dbProject.createdAt,
            updatedAt: dbProject.updatedAt,
            previewImg: fromDbPreviewImg(dbProject),
            description: dbProject.description,
            tags: dbProject.tags ?? [],
        },
    };
};
exports.fromDbProject = fromDbProject;
const toDbProject = (project) => {
    const { previewImgUrl, previewImgPath, previewImgBucket, updatedPreviewImgAt } = toDbPreviewImg(project.metadata.previewImg);
    return {
        id: project.id,
        name: project.name,
        tags: project.metadata.tags ?? [],
        createdAt: project.metadata.createdAt,
        updatedAt: project.metadata.updatedAt,
        description: project.metadata.description,
        previewImgUrl,
        previewImgPath,
        previewImgBucket,
        updatedPreviewImgAt,
        // deprecated
        sandboxId: null,
        sandboxUrl: null,
    };
};
exports.toDbProject = toDbProject;
function fromDbPreviewImg(dbProject) {
    let previewImg = null;
    if (dbProject.previewImgUrl) {
        previewImg = {
            type: 'url',
            url: dbProject.previewImgUrl,
            updatedAt: dbProject.updatedPreviewImgAt,
        };
    }
    else if (dbProject.previewImgPath && dbProject.previewImgBucket) {
        previewImg = {
            type: 'storage',
            storagePath: {
                bucket: dbProject.previewImgBucket,
                path: dbProject.previewImgPath,
            },
            updatedAt: dbProject.updatedPreviewImgAt,
        };
    }
    return previewImg;
}
function toDbPreviewImg(previewImg) {
    let res = {
        previewImgUrl: null,
        previewImgPath: null,
        previewImgBucket: null,
        updatedPreviewImgAt: null,
    };
    if (!previewImg) {
        return res;
    }
    if (previewImg.type === 'url' && previewImg.url) {
        res.previewImgUrl = previewImg.url;
    }
    else if (previewImg.type === 'storage' && previewImg.storagePath && previewImg.storagePath.path && previewImg.storagePath.bucket) {
        res.previewImgPath = previewImg.storagePath.path;
        res.previewImgBucket = previewImg.storagePath.bucket;
    }
    res.updatedPreviewImgAt = previewImg.updatedAt ?? new Date();
    return res;
}
//# sourceMappingURL=project.js.map