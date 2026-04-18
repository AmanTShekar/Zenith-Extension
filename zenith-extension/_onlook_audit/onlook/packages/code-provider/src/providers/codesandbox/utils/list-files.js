"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFiles = listFiles;
async function listFiles(client, { args }) {
    const files = await client.fs.readdir(args.path);
    return {
        files: files.map((file) => ({
            name: file.name,
            type: file.type,
            isSymlink: file.isSymlink,
        })),
    };
}
//# sourceMappingURL=list-files.js.map