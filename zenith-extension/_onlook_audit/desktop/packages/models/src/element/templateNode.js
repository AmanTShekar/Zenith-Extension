"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateNodeSchema = exports.TemplateTagSchema = exports.TemplateTagPositionSchema = void 0;
const zod_1 = require("zod");
const layers_1 = require("./layers");
exports.TemplateTagPositionSchema = zod_1.z.object({
    line: zod_1.z.number(),
    column: zod_1.z.number(),
});
exports.TemplateTagSchema = zod_1.z.object({
    start: exports.TemplateTagPositionSchema,
    end: exports.TemplateTagPositionSchema,
});
exports.TemplateNodeSchema = zod_1.z.object({
    path: zod_1.z.string(),
    startTag: exports.TemplateTagSchema,
    endTag: exports.TemplateTagSchema.nullable(),
    component: zod_1.z.string().nullable(),
    dynamicType: layers_1.DynamicTypeEnum.nullable().optional(),
    coreElementType: layers_1.CoreElementTypeEnum.nullable().optional(),
});
//# sourceMappingURL=templateNode.js.map