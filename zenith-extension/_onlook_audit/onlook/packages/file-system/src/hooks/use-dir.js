"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDirectory = useDirectory;
const react_1 = require("react");
const use_fs_1 = require("./use-fs");
function useDirectory(projectId, branchId, path) {
    const { fs, isInitializing, error: fsError } = (0, use_fs_1.useFS)(projectId, branchId);
    const [entries, setEntries] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!fs)
            return;
        const loadDirectory = async () => {
            try {
                const dirEntries = await fs.readDirectory(path);
                setEntries(dirEntries);
                setError(null);
                setIsLoading(false);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setEntries([]);
                setIsLoading(false);
            }
        };
        loadDirectory();
        return fs.watchDirectory(path, () => {
            loadDirectory();
        });
    }, [fs, path]);
    (0, react_1.useEffect)(() => {
        setIsLoading(true);
    }, [projectId, branchId, path]);
    // Type guards are used below to ensure that the resultant type is correct
    if (isInitializing || isLoading) {
        return { entries: [], loading: true, error: null };
    }
    if (error ?? fsError) {
        return { entries: [], loading: false, error: error ?? fsError };
    }
    return { entries, loading: false, error: null };
}
//# sourceMappingURL=use-dir.js.map