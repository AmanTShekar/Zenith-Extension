"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFile = useFile;
const react_1 = require("react");
const use_fs_1 = require("./use-fs");
function useFile(projectId, branchId, path) {
    const { fs, isInitializing, error: fsError } = (0, use_fs_1.useFS)(projectId, branchId);
    const [content, setContent] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!fs)
            return;
        const loadFile = async () => {
            try {
                const data = await fs.readFile(path);
                setContent(data);
                setError(null);
                setIsLoading(false);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setContent(null);
                setIsLoading(false);
            }
        };
        void loadFile();
        return fs.watchFile(path, () => {
            void loadFile();
        });
    }, [fs, path]);
    (0, react_1.useEffect)(() => {
        setIsLoading(true);
    }, [projectId, branchId, path]);
    // Type guards are used below to ensure that the resultant type is correct
    if (isInitializing || isLoading) {
        return { content: null, loading: true, error: null };
    }
    if (error ?? fsError) {
        return { content: null, loading: false, error: error ?? fsError };
    }
    return { content, loading: false, error: null };
}
//# sourceMappingURL=use-file.js.map