"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docs = void 0;
const config_1 = require("fumadocs-mdx/config");
// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.vercel.app/docs/mdx/collections#define-docs
exports.docs = (0, config_1.defineDocs)({
    docs: {
        schema: config_1.frontmatterSchema,
    },
    meta: {
        schema: config_1.metaSchema,
    },
});
exports.default = (0, config_1.defineConfig)({
    mdxOptions: {
    // MDX options
    },
});
//# sourceMappingURL=source.config.js.map