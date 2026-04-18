"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertImageToNode = insertImageToNode;
exports.removeImageFromNode = removeImageFromNode;
const constants_1 = require("@onlook/models/constants");
const path_1 = require("path");
const files_1 = require("../files");
const style_1 = require("./style");
function insertImageToNode(path, action) {
    const imageName = writeImageToFile(action);
    if (!imageName) {
        console.error('Failed to write image to file');
        return;
    }
    const prefix = constants_1.DefaultSettings.IMAGE_FOLDER.replace(/^public\//, '');
    const backgroundClass = `bg-[url(/${prefix}/${imageName})]`;
    (0, style_1.addClassToNode)(path.node, backgroundClass);
}
function writeImageToFile(action) {
    try {
        const imageFolder = `${action.folderPath}/${constants_1.DefaultSettings.IMAGE_FOLDER}`;
        const imagePath = (0, path_1.join)(imageFolder, action.image.fileName);
        (0, files_1.writeFile)(imagePath, action.image.content, 'base64');
        return action.image.fileName;
    }
    catch (error) {
        console.error('Failed to write image to file', error);
        return null;
    }
}
function removeImageFromNode(path, action) { }
//# sourceMappingURL=image.js.map