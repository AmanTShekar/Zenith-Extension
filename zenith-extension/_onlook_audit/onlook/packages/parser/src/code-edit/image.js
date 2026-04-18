"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertImageToNode = insertImageToNode;
exports.removeImageFromNode = removeImageFromNode;
const constants_1 = require("@onlook/constants");
const style_1 = require("./style");
function insertImageToNode(path, action) {
    const imageName = writeImageToFile(action);
    if (!imageName) {
        console.error('Failed to write image to file');
        return;
    }
    const url = imageName.replace(new RegExp(`^${constants_1.DefaultSettings.IMAGE_FOLDER}\/`), '');
    const backgroundClass = `bg-[url(/${url})]`;
    (0, style_1.addClassToNode)(path.node, backgroundClass);
}
function writeImageToFile(action) {
    // TODO: Implement
    return null;
}
function removeImageFromNode(path, action) { }
//# sourceMappingURL=image.js.map