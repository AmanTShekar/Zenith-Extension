"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreElementTypeEnum = exports.DynamicTypeEnum = void 0;
const zod_1 = require("zod");
exports.DynamicTypeEnum = zod_1.z.enum(['array', 'conditional', 'unknown']);
exports.CoreElementTypeEnum = zod_1.z.enum(['component-root', 'body-tag']);
const LayerNodeSchema = zod_1.z.object({
    domId: zod_1.z.string(),
    webviewId: zod_1.z.string(),
    instanceId: zod_1.z.string().nullable(),
    oid: zod_1.z.string().nullable(),
    textContent: zod_1.z.string(),
    tagName: zod_1.z.string(),
    isVisible: zod_1.z.boolean(),
    dynamicType: exports.DynamicTypeEnum.optional(),
    coreElementType: exports.CoreElementTypeEnum.optional(),
    component: zod_1.z.string().nullable(),
    children: zod_1.z.array(zod_1.z.string()).nullable(),
    parent: zod_1.z.string().nullable(),
});
//# sourceMappingURL=layers.js.map