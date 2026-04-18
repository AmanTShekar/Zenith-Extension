"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileFromContent = getFileFromContent;
exports.readRemoteFile = readRemoteFile;
const utility_1 = require("@onlook/utility");
function getFileFromContent(filePath, content) {
    const type = content instanceof Uint8Array ? 'binary' : 'text';
    const newFile = type === 'binary'
        ? {
            type,
            path: filePath,
            content: content,
        }
        : {
            type,
            path: filePath,
            content: content,
        };
    return newFile;
}
async function readRemoteFile(client, filePath) {
    try {
        if ((0, utility_1.isImageFile)(filePath)) {
            const content = await client.fs.readFile(filePath);
            return getFileFromContent(filePath, content);
        }
        else {
            const content = await client.fs.readTextFile(filePath);
            return getFileFromContent(filePath, content);
        }
    }
    catch (error) {
        console.error(`Error reading remote file ${filePath}:`, error);
        return null;
    }
}
//# sourceMappingURL=utils.js.map