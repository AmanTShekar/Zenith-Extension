"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.source = void 0;
const _source_1 = require("@/.source");
const source_1 = require("fumadocs-core/source");
// See https://fumadocs.vercel.app/docs/headless/source-api for more info
exports.source = (0, source_1.loader)({
    // it assigns a URL to your pages
    baseUrl: '/',
    source: _source_1.docs.toFumadocsSource(),
});
//# sourceMappingURL=source.js.map