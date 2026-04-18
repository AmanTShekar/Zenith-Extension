"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanNextJsImages = scanNextJsImages;
exports.saveImageToProject = saveImageToProject;
exports.deleteImageFromProject = deleteImageFromProject;
exports.renameImageInProject = renameImageInProject;
const constants_1 = require("@onlook/models/constants");
const fs_1 = require("fs");
const mime_lite_1 = __importDefault(require("mime-lite"));
const path_1 = __importDefault(require("path"));
const pages_1 = require("../pages");
const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
const MAX_FILENAME_LENGTH = 255;
const VALID_FILENAME_REGEX = /^[a-zA-Z0-9-_. ]+$/;
async function getImageFolderPath(projectRoot, folder) {
    if (folder) {
        return path_1.default.join(projectRoot, folder);
    }
    const routerType = await (0, pages_1.detectRouterType)(projectRoot);
    return routerType?.basePath
        ? routerType.basePath
        : path_1.default.join(projectRoot, constants_1.DefaultSettings.IMAGE_FOLDER);
}
// Helper function to validate and process image file
async function processImageFile(filePath, folder) {
    const image = await fs_1.promises.readFile(filePath, { encoding: 'base64' });
    const mimeType = mime_lite_1.default.getType(filePath) || 'application/octet-stream';
    return {
        fileName: path_1.default.basename(filePath),
        content: `data:${mimeType};base64,${image}`,
        mimeType,
        folder,
    };
}
async function scanImagesDirectory(projectRoot) {
    const images = [];
    const publicImagesPath = path_1.default.join(projectRoot, constants_1.DefaultSettings.IMAGE_FOLDER);
    try {
        const publicEntries = await fs_1.promises.readdir(publicImagesPath, { withFileTypes: true });
        for (const entry of publicEntries) {
            if (entry.isFile() &&
                SUPPORTED_IMAGE_EXTENSIONS.includes(path_1.default.extname(entry.name).toLowerCase())) {
                const imagePath = path_1.default.join(publicImagesPath, entry.name);
                images.push(await processImageFile(imagePath, constants_1.DefaultSettings.IMAGE_FOLDER));
            }
        }
    }
    catch (error) {
        console.error('Error scanning public images directory:', error);
    }
    // Scan app directory images
    const appDir = path_1.default.join(projectRoot, 'app');
    try {
        const appImages = await findImagesInDirectory(appDir);
        for (const imagePath of appImages) {
            images.push(await processImageFile(imagePath, 'app'));
        }
    }
    catch (error) {
        console.error('Error scanning app directory images:', error);
    }
    return images;
}
async function findImagesInDirectory(dirPath) {
    const imageFiles = [];
    const entries = await fs_1.promises.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path_1.default.join(dirPath, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            imageFiles.push(...(await findImagesInDirectory(fullPath)));
        }
        else if (entry.isFile() &&
            SUPPORTED_IMAGE_EXTENSIONS.includes(path_1.default.extname(entry.name).toLowerCase())) {
            imageFiles.push(fullPath);
        }
    }
    return imageFiles;
}
async function scanNextJsImages(projectRoot) {
    try {
        return await scanImagesDirectory(projectRoot);
    }
    catch (error) {
        console.error('Error scanning images:', error);
        throw error;
    }
}
async function getUniqueFileName(imageFolder, fileName) {
    let imagePath = path_1.default.join(imageFolder, fileName);
    let counter = 1;
    const fileExt = path_1.default.extname(fileName);
    const baseName = path_1.default.basename(fileName, fileExt);
    // Keep trying until we find a unique name
    while (true) {
        try {
            await fs_1.promises.access(imagePath);
            // If file exists, try with a new suffix
            const newFileName = `${baseName} (${counter})${fileExt}`;
            imagePath = path_1.default.join(imageFolder, newFileName);
            counter++;
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                // File doesn't exist, we can use this path
                return path_1.default.basename(imagePath);
            }
            throw err;
        }
    }
}
async function saveImageToProject(projectRoot, image) {
    try {
        const imageFolder = await getImageFolderPath(projectRoot, image.folder);
        const uniqueFileName = await getUniqueFileName(imageFolder, image.fileName);
        const imagePath = path_1.default.join(imageFolder, uniqueFileName);
        if (!image.content) {
            throw new Error('Can not save image with empty content');
        }
        const buffer = Buffer.from(image.content.replace(/^data:[^,]+,/, ''), 'base64');
        await fs_1.promises.writeFile(imagePath, buffer);
        return imagePath;
    }
    catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}
async function deleteImageFromProject(projectRoot, image) {
    try {
        const imageFolder = await getImageFolderPath(projectRoot, image.folder);
        const imagePath = path_1.default.join(imageFolder, image.fileName);
        await fs_1.promises.unlink(imagePath);
        return imagePath;
    }
    catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}
async function renameImageInProject(projectRoot, image, newName) {
    if (!image.fileName || !newName) {
        throw new Error('Image name and new name are required');
    }
    const imageFolder = await getImageFolderPath(projectRoot, image.folder);
    const oldImagePath = path_1.default.join(imageFolder, image.fileName);
    const newImagePath = path_1.default.join(imageFolder, newName);
    try {
        await validateRename(oldImagePath, newImagePath);
        await fs_1.promises.rename(oldImagePath, newImagePath);
        await updateImageReferences(projectRoot, image.fileName, newName);
        return newImagePath;
    }
    catch (error) {
        console.error('Error renaming image:', error);
        throw error;
    }
}
async function validateRename(oldImagePath, newImagePath) {
    try {
        await fs_1.promises.access(oldImagePath);
    }
    catch (err) {
        throw new Error(`Source image does not exist`);
    }
    const newFileName = path_1.default.basename(newImagePath);
    if (newFileName.length > MAX_FILENAME_LENGTH) {
        throw new Error(`File name is too long (max ${MAX_FILENAME_LENGTH} characters)`);
    }
    if (!VALID_FILENAME_REGEX.test(newFileName)) {
        throw new Error('File name can only contain letters, numbers, spaces, hyphens, underscores, and periods');
    }
    try {
        await fs_1.promises.access(newImagePath);
        throw new Error(`A file with this name already exists`);
    }
    catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }
}
async function updateImageReferences(projectRoot, oldName, newName) {
    const prefix = constants_1.DefaultSettings.IMAGE_FOLDER.replace(/^public\//, '');
    const oldImageUrl = `/${prefix}/${oldName}`;
    const newImageUrl = `/${prefix}/${newName}`;
    const pattern = new RegExp(oldImageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const sourceFiles = await findSourceFiles(projectRoot);
    await Promise.all(sourceFiles.map(async (file) => {
        const content = await fs_1.promises.readFile(file, 'utf8');
        if (!content.includes(oldImageUrl)) {
            return;
        }
        const updatedContent = content.replace(pattern, newImageUrl);
        await fs_1.promises.writeFile(file, updatedContent, 'utf8');
    }));
}
async function findSourceFiles(dirPath, maxDepth = 10, currentDepth = 0) {
    if (currentDepth >= maxDepth) {
        console.warn(`Max directory depth (${maxDepth}) reached at: ${dirPath}`);
        return [];
    }
    const files = [];
    const entries = await fs_1.promises.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path_1.default.join(dirPath, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            files.push(...(await findSourceFiles(fullPath, maxDepth, currentDepth + 1)));
        }
        else if (entry.isFile() &&
            (entry.name.endsWith('.tsx') ||
                entry.name.endsWith('.jsx') ||
                entry.name.endsWith('.ts'))) {
            files.push(fullPath);
        }
    }
    return files;
}
//# sourceMappingURL=images.js.map