"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = writeFile;
const utility_1 = require("@onlook/utility");
async function writeFile(client, { args }) {
    const normalizedPath = (0, utility_1.normalizePath)(args.path);
    try {
        if (typeof args.content === 'string') {
            await client.fs.writeTextFile(normalizedPath, args.content);
        }
        else if (args.content instanceof Uint8Array) {
            await client.fs.writeFile(normalizedPath, args.content);
        }
        else {
            throw new Error(`Invalid content type ${typeof args.content}`);
        }
        return { success: true };
    }
    catch (error) {
        console.error(`Error writing remote file ${normalizedPath}:`, error);
        return { success: false };
    }
}
//# sourceMappingURL=write-file.js.map