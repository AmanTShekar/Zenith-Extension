"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFS = useFS;
const react_1 = require("react");
const code_fs_1 = require("../code-fs");
function useFS(projectId, branchId) {
    const [fs, setFs] = (0, react_1.useState)(null);
    const [isInitializing, setIsInitializing] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fileSystem = new code_fs_1.CodeFileSystem(projectId, branchId);
        fileSystem
            .initialize()
            .then(() => {
            setFs(fileSystem);
            setError(null);
            setIsInitializing(false);
        })
            .catch((err) => {
            setError(err instanceof Error ? err : new Error('Failed to initialize file system'));
            setFs(null);
            setIsInitializing(false);
        });
        return () => {
            fileSystem.cleanup();
        };
    }, [projectId, branchId]);
    // Type guards are used below to ensure that the resultant type is correct
    if (isInitializing) {
        return { fs: null, isInitializing: true, error: null };
    }
    if (error) {
        return { fs: null, isInitializing: false, error };
    }
    return { fs: fs, isInitializing: false, error: null };
}
//# sourceMappingURL=use-fs.js.map