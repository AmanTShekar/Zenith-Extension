"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS_MESSAGE = exports.PLACEHOLDER_NAMES = exports.CreateMethod = void 0;
exports.getRandomPlaceholder = getRandomPlaceholder;
exports.getRandomSettingsMessage = getRandomSettingsMessage;
exports.getPreviewImage = getPreviewImage;
exports.getStepName = getStepName;
exports.getNameFromPath = getNameFromPath;
exports.getFolderNameAndTargetPath = getFolderNameAndTargetPath;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const helpers_1 = require("/common/helpers");
var CreateMethod;
(function (CreateMethod) {
    CreateMethod["LOAD"] = "load";
    CreateMethod["NEW"] = "new";
})(CreateMethod || (exports.CreateMethod = CreateMethod = {}));
exports.PLACEHOLDER_NAMES = [
    'The greatest app in the world',
    'My epic project',
    'The greatest project ever',
    'A revolutionary idea',
    'Project X',
    'Genius React App',
    'The next billion dollar idea',
    'Mind-blowingly cool app',
    'Earth-shatteringly great app',
    'Moonshot project',
];
exports.SETTINGS_MESSAGE = [
    'Set some dials and knobs and stuff',
    'Fine-tune how you want to build',
    'Swap out your default code editor if you dare',
    "You shouldn't be worried about this stuff, yet here you are",
    'Mostly a formality',
    "What's this button do?",
    'Customize how you want to build',
    'Thanks for stopping by the Settings page',
    'This is where the good stuff is',
    'Open 24 hours, 7 days a week',
    '*beep boop*',
    "Welcome. We've been expecting you.",
];
function getRandomPlaceholder() {
    return exports.PLACEHOLDER_NAMES[Math.floor(Math.random() * exports.PLACEHOLDER_NAMES.length)];
}
function getRandomSettingsMessage() {
    return exports.SETTINGS_MESSAGE[Math.floor(Math.random() * exports.SETTINGS_MESSAGE.length)];
}
async function getPreviewImage(filename) {
    const base64Img = (await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_IMAGE, filename));
    if (!base64Img) {
        return null;
    }
    return base64Img;
}
const STEP_MAP = {
    [CreateMethod.LOAD]: ['Select folder', 'Verify project', 'Name project', 'Set URL'],
    [CreateMethod.NEW]: ['Name project', 'Select folder', 'Install project', 'Run project'],
};
function getStepName(method, step) {
    try {
        if (!method) {
            return 'Unknown Method';
        }
        return STEP_MAP[method][step];
    }
    catch (e) {
        return 'Unknown Step';
    }
}
function getNameFromPath(path) {
    const parts = path.split(/[/\\]/);
    const name = parts.pop() || '';
    return (0, helpers_1.capitalizeFirstLetter)(name);
}
function getFolderNameAndTargetPath(fullPath) {
    const pathParts = fullPath.split(/[/\\]/);
    const newFolderName = pathParts[pathParts.length - 1] || '';
    const pathToFolders = pathParts.slice(0, -1).join(utils_1.platformSlash);
    return { name: newFolderName, path: pathToFolders };
}
//# sourceMappingURL=helpers.js.map