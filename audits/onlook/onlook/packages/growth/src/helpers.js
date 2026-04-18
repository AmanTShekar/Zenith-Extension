"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutPath = void 0;
const getLayoutPath = async (projectPath, fileExists) => {
    const possibleLayoutPaths = [
        `${projectPath}/src/app/layout.tsx`,
        `${projectPath}/app/layout.tsx`,
    ];
    for (const path of possibleLayoutPaths) {
        const exists = await fileExists(path);
        if (exists) {
            return path;
        }
    }
    return null;
};
exports.getLayoutPath = getLayoutPath;
//# sourceMappingURL=helpers.js.map