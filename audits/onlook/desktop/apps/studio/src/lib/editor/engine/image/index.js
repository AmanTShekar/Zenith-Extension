"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageManager = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const mime_lite_1 = __importDefault(require("mime-lite"));
const mobx_1 = require("mobx");
const non_secure_1 = require("nanoid/non-secure");
class ImageManager {
    editorEngine;
    projectsManager;
    images = [];
    constructor(editorEngine, projectsManager) {
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this);
        this.scanImages();
    }
    async upload(file) {
        try {
            const projectFolder = this.projectsManager.project?.folderPath;
            if (!projectFolder) {
                throw new Error('Project folder not found');
            }
            const buffer = await file.arrayBuffer();
            const base64String = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
            const image = {
                content: base64String,
                fileName: file.name,
                mimeType: file.type,
                folder: constants_1.DefaultSettings.IMAGE_FOLDER,
            };
            await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SAVE_IMAGE_TO_PROJECT, {
                projectFolder,
                image,
            });
            setTimeout(() => {
                this.scanImages();
            }, 100);
            (0, utils_1.sendAnalytics)('image upload');
        }
        catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }
    async delete(image) {
        try {
            const projectFolder = this.projectsManager.project?.folderPath;
            if (!projectFolder) {
                throw new Error('Project folder not found');
            }
            await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.DELETE_IMAGE_FROM_PROJECT, {
                projectFolder,
                image,
            });
            this.scanImages();
            (0, utils_1.sendAnalytics)('image delete');
        }
        catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }
    async rename(image, newName) {
        try {
            const projectFolder = this.projectsManager.project?.folderPath;
            if (!projectFolder) {
                throw new Error('Project folder not found');
            }
            await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.RENAME_IMAGE_IN_PROJECT, {
                projectFolder,
                image,
                newName,
            });
            this.scanImages();
            (0, utils_1.sendAnalytics)('image rename');
        }
        catch (error) {
            console.error('Error renaming image:', error);
            throw error;
        }
    }
    async insert(base64Image, mimeType) {
        const targets = this.getTargets();
        if (!targets || targets.length === 0) {
            return;
        }
        try {
            const response = await fetch(base64Image);
            const blob = await response.blob();
            const file = new File([blob], 'image', { type: mimeType });
            const compressedBase64 = await (0, utils_1.compressImage)(file);
            if (!compressedBase64) {
                console.error('Failed to compress image');
                return;
            }
            base64Image = compressedBase64;
        }
        catch (error) {
            console.error('Error compressing image:', error);
            return;
        }
        const fileName = `${(0, non_secure_1.nanoid)(4)}.${mime_lite_1.default.getExtension(mimeType)}`;
        const action = {
            type: 'insert-image',
            targets: targets,
            image: {
                content: base64Image,
                fileName: fileName,
                mimeType: mimeType,
            },
        };
        this.editorEngine.action.run(action);
        setTimeout(() => {
            this.scanImages();
        }, 2000);
        (0, utils_1.sendAnalytics)('image insert', { mimeType });
    }
    get assets() {
        return this.images;
    }
    remove() {
        this.editorEngine.style.update('backgroundImage', 'none');
        (0, utils_1.sendAnalytics)('image-removed');
    }
    getTargets() {
        const selected = this.editorEngine.elements.selected;
        if (!selected || selected.length === 0) {
            console.error('No elements selected');
            return;
        }
        const targets = selected.map((element) => ({
            webviewId: element.webviewId,
            domId: element.domId,
            oid: element.oid,
        }));
        return targets;
    }
    async scanImages() {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            console.warn('No project root found');
            return;
        }
        const images = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SCAN_IMAGES_IN_PROJECT, projectRoot);
        if (images?.length) {
            this.images = images;
        }
        else {
            this.images = [];
        }
    }
    dispose() {
        this.images = [];
    }
}
exports.ImageManager = ImageManager;
//# sourceMappingURL=index.js.map