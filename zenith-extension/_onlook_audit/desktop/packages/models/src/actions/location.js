"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionLocationSchema = exports.IndexActionLocationSchema = void 0;
const zod_1 = require("zod");
const BaseActionLocationSchema = zod_1.z.object({
    type: zod_1.z.enum(['prepend', 'append']),
    targetDomId: zod_1.z.string(),
    targetOid: zod_1.z.string().nullable(),
});
exports.IndexActionLocationSchema = BaseActionLocationSchema.extend({
    type: zod_1.z.literal('index'),
    index: zod_1.z.number(),
    originalIndex: zod_1.z.number(),
});
exports.ActionLocationSchema = zod_1.z.discriminatedUnion('type', [
    exports.IndexActionLocationSchema,
    BaseActionLocationSchema,
]);
//# sourceMappingURL=location.js.map