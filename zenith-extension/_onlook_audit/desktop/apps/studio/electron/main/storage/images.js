"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageStorage = void 0;
const electron_1 = require("electron");
const fs_1 = require("fs");
const path_1 = require("path");
class ImageStorage {
    static instance;
    IMAGES_FOLDER;
    constructor() {
        const APP_PATH = electron_1.app.getPath('userData');
        this.IMAGES_FOLDER = (0, path_1.join)(APP_PATH, 'images');
        this.ensureImagesFolderExists();
    }
    static getInstance() {
        if (!ImageStorage.instance) {
            ImageStorage.instance = new ImageStorage();
        }
        return ImageStorage.instance;
    }
    ensureImagesFolderExists() {
        if (!(0, fs_1.existsSync)(this.IMAGES_FOLDER)) {
            (0, fs_1.mkdirSync)(this.IMAGES_FOLDER, { recursive: true });
        }
    }
    readImage(fileName) {
        const filePath = (0, path_1.join)(this.IMAGES_FOLDER, fileName);
        try {
            if ((0, fs_1.existsSync)(filePath)) {
                const base64Img = (0, fs_1.readFileSync)(filePath, { encoding: 'base64' });
                const processedBase64Img = `data:image/png;base64,${base64Img}`;
                return processedBase64Img;
            }
            console.error(`Image not found: ${filePath}`);
            return null;
        }
        catch (error) {
            console.error(`Error reading image ${fileName}:`, error);
            return null;
        }
    }
    writeImage(fileName, base64Img) {
        const data = base64Img.replace(/^data:image\/\w+;base64,/, '');
        const imageData = Buffer.from(data, 'base64');
        const filePath = (0, path_1.join)(this.IMAGES_FOLDER, fileName);
        try {
            (0, fs_1.writeFileSync)(filePath, new Uint8Array(imageData));
            return filePath;
        }
        catch (error) {
            console.error(`Error saving image ${fileName}:`, error);
            return null;
        }
    }
    deleteImage(fileName) {
        const filePath = (0, path_1.join)(this.IMAGES_FOLDER, fileName);
        try {
            if ((0, fs_1.existsSync)(filePath)) {
                (0, fs_1.unlinkSync)(filePath);
                return true;
            }
            console.log(`Image not found: ${filePath}`);
            return false;
        }
        catch (error) {
            console.error(`Error deleting image ${fileName}:`, error);
            return false;
        }
    }
    listImages() {
        try {
            return (0, fs_1.readdirSync)(this.IMAGES_FOLDER);
        }
        catch (error) {
            console.error('Error listing images:', error);
            return [];
        }
    }
}
exports.imageStorage = ImageStorage.getInstance();
//# sourceMappingURL=images.js.map