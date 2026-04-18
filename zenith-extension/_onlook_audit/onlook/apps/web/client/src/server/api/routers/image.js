"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageRouter = void 0;
const image_server_1 = require("@onlook/image-server");
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
exports.imageRouter = (0, trpc_1.createTRPCRouter)({
    compress: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        imageData: zod_1.z.string(), // base64 encoded image data
        options: zod_1.z.object({
            quality: zod_1.z.number().optional(),
            width: zod_1.z.number().optional(),
            height: zod_1.z.number().optional(),
            format: zod_1.z.enum(['jpeg', 'png', 'webp', 'avif', 'auto']).optional(),
            progressive: zod_1.z.boolean().optional(),
            mozjpeg: zod_1.z.boolean().optional(),
            effort: zod_1.z.number().optional(),
            compressionLevel: zod_1.z.number().optional(),
            keepAspectRatio: zod_1.z.boolean().optional(),
            withoutEnlargement: zod_1.z.boolean().optional(),
        }).optional(),
    }))
        .mutation(async ({ input }) => {
        try {
            const buffer = Buffer.from(input.imageData, 'base64');
            const result = await (0, image_server_1.compressImageServer)(buffer, undefined, // No output path - return buffer
            input.options || {});
            // Convert buffer to base64 for client transmission
            if (result.success && result.buffer) {
                const { buffer: resultBuffer, ...restResult } = result;
                return {
                    ...restResult,
                    bufferData: resultBuffer.toString('base64'),
                };
            }
            const { buffer: resultBuffer, ...restResult } = result;
            return restResult;
        }
        catch (error) {
            console.error('Error compressing image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown compression error',
            };
        }
    }),
});
//# sourceMappingURL=image.js.map