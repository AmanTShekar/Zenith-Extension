"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultProjectSettings = void 0;
const constants_1 = require("@onlook/constants");
const createDefaultProjectSettings = (projectId) => {
    return {
        projectId,
        buildCommand: constants_1.DefaultSettings.COMMANDS.build,
        runCommand: constants_1.DefaultSettings.COMMANDS.run,
        installCommand: constants_1.DefaultSettings.COMMANDS.install,
    };
};
exports.createDefaultProjectSettings = createDefaultProjectSettings;
//# sourceMappingURL=project-settings.js.map