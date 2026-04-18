"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = readFile;
const utility_1 = require("@onlook/utility");
const utils_1 = require("./utils");
async function readFile(client, { args }) {
    const file = await (0, utils_1.readRemoteFile)(client, args.path);
    if (!file) {
        throw new Error(`Failed to read file ${args.path}`);
    }
    if (file.type === 'text') {
        return {
            file: {
                path: file.path,
                content: file.content,
                type: file.type,
                toString: () => {
                    return file.content;
                },
            },
        };
    }
    else {
        return {
            file: {
                path: file.path,
                content: file.content,
                type: file.type,
                toString: () => {
                    // WARNING: This is not correct base64
                    return file.content ? (0, utility_1.convertToBase64)(file.content) : '';
                },
            },
        };
    }
}
//# sourceMappingURL=read-file.js.map