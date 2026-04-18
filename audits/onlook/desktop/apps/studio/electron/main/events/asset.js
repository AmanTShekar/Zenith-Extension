"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForAssetMessages = listenForAssetMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const images_1 = require("../assets/images");
function listenForAssetMessages() {
    electron_1.ipcMain.handle(constants_1.MainChannels.SCAN_IMAGES_IN_PROJECT, async (_event, projectRoot) => {
        const images = await (0, images_1.scanNextJsImages)(projectRoot);
        return images;
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SAVE_IMAGE_TO_PROJECT, async (_event, { projectFolder, image, }) => {
        const imagePath = await (0, images_1.saveImageToProject)(projectFolder, image);
        return imagePath;
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.DELETE_IMAGE_FROM_PROJECT, async (_event, { projectFolder, image, }) => {
        const imagePath = await (0, images_1.deleteImageFromProject)(projectFolder, image);
        return imagePath;
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.RENAME_IMAGE_IN_PROJECT, async (_event, { projectFolder, image, newName, }) => {
        const imagePath = await (0, images_1.renameImageInProject)(projectFolder, image, newName);
        return imagePath;
    });
}
//# sourceMappingURL=asset.js.map