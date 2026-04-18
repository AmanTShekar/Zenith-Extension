"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useImageOperations = void 0;
const hooks_1 = require("@onlook/file-system/hooks");
const utility_1 = require("@onlook/utility");
const file_1 = require("@onlook/utility/src/file");
const path_1 = __importDefault(require("path"));
const react_1 = require("react");
const image_references_1 = require("../utils/image-references");
const useImageOperations = (projectId, branchId, activeFolder, codeEditor, editorEngine) => {
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    // Get directory entries
    const { entries: rootEntries, loading, error } = (0, hooks_1.useDirectory)(projectId, branchId, activeFolder);
    const { entries: activeFolderEntries } = (0, hooks_1.useDirectory)(projectId, branchId, activeFolder);
    // Get available folders
    const folders = (0, react_1.useMemo)(() => {
        if (!rootEntries)
            return [];
        return rootEntries.filter(entry => entry.isDirectory);
    }, [rootEntries]);
    // Get images in the active folder
    const images = (0, react_1.useMemo)(() => {
        if (!activeFolderEntries)
            return [];
        const imageEntries = activeFolderEntries.filter(entry => !entry.isDirectory && (0, file_1.isImageFile)(entry.name));
        return imageEntries;
    }, [activeFolderEntries]);
    // Handle file upload
    const handleUpload = async (files) => {
        if (!codeEditor || !files.length)
            return;
        setIsUploading(true);
        try {
            for (const file of Array.from(files)) {
                const sanitizedName = (0, utility_1.sanitizeFilename)(file.name);
                // Check if it's an image file (using original name for validation)
                if (!(0, file_1.isImageFile)(file.name)) {
                    console.warn(`Skipping non-image file: ${file.name}`);
                    continue;
                }
                // Read file content
                const arrayBuffer = await file.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                const filePath = path_1.default.join(activeFolder, sanitizedName);
                await codeEditor.writeFile(filePath, uint8Array);
            }
        }
        catch (error) {
            console.error('Failed to upload files:', error);
            throw error; // Re-throw for error handling in component
        }
        finally {
            setIsUploading(false);
        }
    };
    // Handle file rename
    const handleRename = async (oldPath, newName) => {
        if (!codeEditor)
            throw new Error('Code editor not available');
        const directory = path_1.default.dirname(oldPath);
        const sanitizedName = (0, utility_1.sanitizeFilename)(newName);
        const newPath = path_1.default.join(directory, sanitizedName);
        // Find all JS/TS files in the project
        const allFiles = await codeEditor.listFiles('**/*');
        const jsFiles = allFiles.filter(f => {
            const ext = path_1.default.extname(f);
            // Only process JS/TS/JSX/TSX files, skip test files and build dirs
            return ['.js', '.jsx', '.ts', '.tsx'].includes(ext) &&
                !f.includes('node_modules') &&
                !f.includes('.next') &&
                !f.includes('dist') &&
                !f.endsWith('.test.ts') &&
                !f.endsWith('.test.tsx');
        });
        // Update references in parallel
        const updatePromises = [];
        const oldFileName = path_1.default.basename(oldPath);
        for (const file of jsFiles) {
            const filePath = path_1.default.join('/', file);
            updatePromises.push((async () => {
                try {
                    const content = await codeEditor.readFile(filePath);
                    if (typeof content !== 'string' || !content.includes(oldFileName)) {
                        return;
                    }
                    const updatedContent = await (0, image_references_1.updateImageReferences)(content, oldPath, newPath);
                    if (updatedContent !== content) {
                        await codeEditor.writeFile(filePath, updatedContent);
                    }
                }
                catch (error) {
                    console.warn(`Failed to update references in ${filePath}:`, error);
                }
            })());
        }
        // Wait for all updates to complete
        await Promise.all(updatePromises);
        // Finally, rename the actual image file
        await codeEditor.moveFile(oldPath, newPath);
        // Refresh all frame views after a slight delay to show updated image references
        setTimeout(() => {
            editorEngine?.frames.reloadAllViews();
        }, 500);
    };
    // Handle file delete
    const handleDelete = async (filePath) => {
        if (!codeEditor)
            throw new Error('Code editor not available');
        await codeEditor.deleteFile(filePath);
    };
    return {
        folders,
        images,
        loading,
        error,
        isUploading,
        handleUpload,
        handleRename,
        handleDelete,
    };
};
exports.useImageOperations = useImageOperations;
//# sourceMappingURL=use-image-operations.js.map