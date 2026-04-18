"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageManager = void 0;
const utility_1 = require("@onlook/utility");
const mobx_1 = require("mobx");
const path_1 = __importDefault(require("path"));
class ImageManager {
    editorEngine;
    _imagePaths = [];
    _isSelectingImage = false;
    _selectedImage = null;
    _previewImage = null;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    init() { }
    get imagePaths() {
        return this._imagePaths;
    }
    get isSelectingImage() {
        return this._isSelectingImage;
    }
    get selectedImage() {
        return this._selectedImage;
    }
    get previewImage() {
        return this._previewImage;
    }
    setPreviewImage(image) {
        try {
            this._previewImage = image;
            const selected = this.editorEngine.elements.selected;
            if (!selected || selected.length === 0) {
                console.warn('No elements selected to apply background image');
                return;
            }
            if (image?.originPath) {
                const url = (0, utility_1.stripImageFolderPrefix)(image.originPath);
                this.editorEngine.style.updateMultiple({
                    backgroundImage: `url('/${url}')`,
                });
            }
            else if (this.selectedImage?.originPath) {
                const url = (0, utility_1.stripImageFolderPrefix)(this.selectedImage.originPath);
                this.editorEngine.style.updateMultiple({
                    backgroundImage: `url('/${url}')`,
                });
            }
            else {
                this.editorEngine.style.updateMultiple({
                    backgroundImage: 'none',
                });
            }
        }
        catch (error) {
            console.error('Failed to set preview image:', error);
        }
    }
    setSelectedImage(image) {
        try {
            this._selectedImage = image;
            const selected = this.editorEngine.elements.selected;
            if (!selected || selected.length === 0) {
                console.warn('No elements selected to apply background image');
                return;
            }
            if (!image?.originPath) {
                console.warn('Image origin path is missing');
                return;
            }
            try {
                const url = (0, utility_1.stripImageFolderPrefix)(image.originPath);
                if (!url) {
                    throw new Error('Failed to generate relative path');
                }
                const styles = {
                    backgroundImage: `url('/${url}')`,
                };
                this.editorEngine.style.updateMultiple(styles);
            }
            catch (urlError) {
                console.error('Failed to process image path:', urlError);
                throw new Error('Invalid image path');
            }
        }
        catch (error) {
            console.error('Failed to apply background image:', error);
        }
    }
    setIsSelectingImage(isSelectingImage) {
        this._isSelectingImage = isSelectingImage;
    }
    async upload(file, destinationFolder) {
        try {
            // Sanitize filename from user upload
            const sanitizedName = (0, utility_1.sanitizeFilename)(file.name);
            const filePath = path_1.default.join(destinationFolder, sanitizedName);
            const uint8Array = new Uint8Array(await file.arrayBuffer());
            await this.editorEngine.activeSandbox.writeFile(filePath, uint8Array);
        }
        catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }
    search(name) {
        return this.imagePaths.find((img) => name.includes(img));
    }
    getTargets() {
        const selected = this.editorEngine.elements.selected;
        if (!selected || selected.length === 0) {
            console.error('No elements selected');
            return;
        }
        const targets = selected.map((element) => ({
            frameId: element.frameId,
            branchId: element.branchId,
            domId: element.domId,
            oid: element.oid,
        }));
        return targets;
    }
    /**
     * Read content of a single image file
     */
    async readImageContent(imagePath) {
        try {
            // Validate if the file is an image
            if (!(0, utility_1.isImageFile)(imagePath)) {
                console.warn(`File ${imagePath} is not a valid image file`);
                return null;
            }
            // Determine MIME type based on file extension
            const mimeType = (0, utility_1.getMimeType)(imagePath);
            // Read the file using the sandbox
            const file = await this.editorEngine.activeSandbox.readFile(imagePath);
            let content;
            // Handle SVG files more efficiently by reading as text if available
            if (mimeType === 'image/svg+xml' && typeof file === 'string') {
                // For SVG files read as text, create a data URL directly
                content = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(file)}`;
            }
            else if (file instanceof Uint8Array) {
                // For binary files, convert to base64
                content = (0, utility_1.convertToBase64DataUrl)(file, mimeType);
            }
            else {
                console.warn(`Unexpected file type or content format for ${imagePath}`);
                return null;
            }
            return {
                originPath: imagePath,
                content,
                fileName: (0, utility_1.getBaseName)(imagePath),
                mimeType,
            };
        }
        catch (error) {
            console.error(`Error reading image content for ${imagePath}:`, error);
            return null;
        }
    }
    /**
     * Read content of multiple image files in parallel
     */
    async readImagesContent(imagePaths) {
        if (!imagePaths.length) {
            return [];
        }
        try {
            // Process all images in parallel
            const imagePromises = imagePaths.map((path) => this.readImageContent(path));
            const results = await Promise.all(imagePromises);
            // Filter out null results
            const validImages = results.filter((result) => !!result);
            return validImages;
        }
        catch (error) {
            console.error('Error reading images content:', error);
            return [];
        }
    }
    clear() {
        this._imagePaths = [];
        this._selectedImage = null;
        this._previewImage = null;
        this._isSelectingImage = false;
    }
}
exports.ImageManager = ImageManager;
//# sourceMappingURL=index.js.map