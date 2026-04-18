"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToWebview = exports.invokeMainChannel = exports.getRunProjectCommand = exports.isMetaKey = exports.sendAnalyticsError = exports.platformSlash = void 0;
exports.sendAnalytics = sendAnalytics;
exports.getTruncatedFileName = getTruncatedFileName;
exports.createDomId = createDomId;
exports.createOid = createOid;
exports.compressImage = compressImage;
const constants_1 = require("@onlook/models/constants");
const utility_1 = require("@onlook/utility");
const browser_image_compression_1 = __importDefault(require("browser-image-compression"));
const non_secure_1 = require("nanoid/non-secure");
const ids_1 = require("/common/helpers/ids");
exports.platformSlash = window.env.PLATFORM === 'win32' ? '\\' : '/';
function sendAnalytics(event, data) {
    try {
        window.api.send(constants_1.MainChannels.SEND_ANALYTICS, { event, data });
    }
    catch (e) {
        console.error('Error sending analytics', e);
    }
}
const sendAnalyticsError = (event, data) => {
    window.api.send(constants_1.MainChannels.SEND_ANALYTICS_ERROR, { event, data });
};
exports.sendAnalyticsError = sendAnalyticsError;
const isMetaKey = (e) => process.platform === 'darwin' ? e.metaKey : e.ctrlKey;
exports.isMetaKey = isMetaKey;
function getTruncatedFileName(fileName) {
    const parts = fileName.split(exports.platformSlash);
    return parts[parts.length - 1];
}
const getRunProjectCommand = (folderPath) => {
    const platformCommand = process.platform === 'win32' ? 'cd /d' : 'cd';
    return `${platformCommand} ${folderPath} && ${constants_1.DefaultSettings.COMMANDS.run}`;
};
exports.getRunProjectCommand = getRunProjectCommand;
const invokeMainChannel = async (channel, ...args) => {
    return window.api.invoke(channel, ...args.map(utility_1.jsonClone));
};
exports.invokeMainChannel = invokeMainChannel;
const sendToWebview = (webview, channel, ...args) => {
    return webview.send(channel, ...args.map(utility_1.jsonClone));
};
exports.sendToWebview = sendToWebview;
const generateCustomId = (0, non_secure_1.customAlphabet)(ids_1.VALID_DATA_ATTR_CHARS, 7);
function createDomId() {
    return `odid-${generateCustomId()}`;
}
function createOid() {
    return `${generateCustomId()}`;
}
async function compressImage(file) {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
    };
    try {
        const compressedFile = await (0, browser_image_compression_1.default)(file, options);
        const base64URL = browser_image_compression_1.default.getDataUrlFromFile(compressedFile);
        console.log(`Image size reduced from ${file.size} to ${compressedFile.size} (bytes)`);
        return base64URL;
    }
    catch (error) {
        console.error('Error compressing image:', error);
    }
}
//# sourceMappingURL=index.js.map