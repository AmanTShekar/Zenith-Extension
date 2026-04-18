"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadImageTool = void 0;
const mime_lite_1 = __importDefault(require("mime-lite"));
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const models_1 = require("@onlook/models");
const icons_1 = require("@onlook/ui/icons");
const client_1 = require("../models/client");
const type_1 = require("../shared/type");
class UploadImageTool extends client_1.ClientTool {
    static toolName = 'upload_image';
    static description = "Uploads a NEW image from the <available-images> list in the chat context to the project's file system. IMPORTANT: Only use this for images listed in the <available-images> section that need to be uploaded. DO NOT use this for images in the <local-images> section - those already exist in the project and should be referenced directly by their existing path. The image will be stored in public/ directory by default and can be referenced in code. After uploading, you can use the file path in your code changes.";
    static parameters = zod_1.z.object({
        image_id: zod_1.z.string().describe('The unique ID of the image from the available images list'),
        destination_path: zod_1.z
            .string()
            .optional()
            .describe('Destination path within the project. Defaults to "public" if not specified.'),
        filename: zod_1.z
            .string()
            .optional()
            .describe('Custom filename (without extension). If not provided, a UUID will be generated'),
        branchId: type_1.BRANCH_ID_SCHEMA,
    });
    static icon = icons_1.Icons.Image;
    async handle(args, editorEngine) {
        try {
            const sandbox = editorEngine.branches.getSandboxById(args.branchId);
            if (!sandbox) {
                throw new Error(`Sandbox not found for branch ID: ${args.branchId}`);
            }
            // Get the current conversation ID
            const conversationId = editorEngine.chat.getCurrentConversationId();
            if (!conversationId) {
                throw new Error('No active conversation found');
            }
            // Fetch all messages from the conversation
            const messages = await editorEngine.api.getConversationMessages(conversationId);
            // Find the image in message contexts by ID, searching from most recent to oldest
            let imageContext = null;
            for (let i = messages.length - 1; i >= 0; i--) {
                const message = messages[i];
                if (!message?.metadata?.context)
                    continue;
                const contexts = message.metadata.context;
                const imageContexts = contexts.filter((ctx) => ctx.type === models_1.MessageContextType.IMAGE);
                // Find image by ID
                const match = imageContexts.find((ctx) => ctx.id === args.image_id);
                if (match) {
                    imageContext = match;
                    break;
                }
            }
            if (!imageContext) {
                throw new Error(`No image found with ID: ${args.image_id}`);
            }
            // Check if this is a local image that already exists in the project
            if (imageContext.source === 'local') {
                throw new Error(`Image "${imageContext.displayName}" already exists in the project at ${imageContext.path}. ` +
                    `Reference it directly in your code without uploading.`);
            }
            // Upload the image to the sandbox
            const fullPath = await this.uploadImageToSandbox(imageContext, args, sandbox);
            return `Image "${imageContext.displayName}" uploaded successfully to ${fullPath}`;
        }
        catch (error) {
            throw new Error(`Cannot upload image: ${error}`);
        }
    }
    static getLabel(input) {
        if (input?.filename) {
            return 'Uploading image ' + input.filename.substring(0, 20);
        }
        return 'Uploading image';
    }
    async uploadImageToSandbox(imageContext, args, sandbox) {
        const mimeType = imageContext.mimeType;
        const extension = mime_lite_1.default.getExtension(mimeType) || 'png';
        const filename = args.filename
            ? `${args.filename}.${extension}`
            : `${(0, uuid_1.v4)()}.${extension}`;
        const destinationPath = args.destination_path?.trim() || 'public';
        const fullPath = `${destinationPath}/${filename}`;
        // Extract base64 data from the content (remove data URL prefix if present)
        const base64Data = imageContext.content.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
        const binaryData = this.base64ToUint8Array(base64Data);
        await sandbox.writeFile(fullPath, binaryData);
        return fullPath;
    }
    base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
}
exports.UploadImageTool = UploadImageTool;
//# sourceMappingURL=upload-image.js.map