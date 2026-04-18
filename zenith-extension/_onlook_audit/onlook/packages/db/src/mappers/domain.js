"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDomainInfoFromPublished = exports.toDomainInfoFromPreview = void 0;
const models_1 = require("@onlook/models");
const toDomainInfoFromPreview = (previewDomain) => {
    return {
        url: previewDomain.fullDomain,
        type: models_1.DomainType.PREVIEW,
        publishedAt: previewDomain.updatedAt,
    };
};
exports.toDomainInfoFromPreview = toDomainInfoFromPreview;
const toDomainInfoFromPublished = (projectCustomDomain) => {
    return {
        url: projectCustomDomain.fullDomain,
        type: models_1.DomainType.CUSTOM,
        publishedAt: projectCustomDomain.updatedAt,
    };
};
exports.toDomainInfoFromPublished = toDomainInfoFromPublished;
//# sourceMappingURL=domain.js.map