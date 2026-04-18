"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDbProjectSettings = exports.fromDbProjectSettings = void 0;
const fromDbProjectSettings = (dbProjectSettings) => {
    return {
        commands: {
            build: dbProjectSettings.buildCommand,
            run: dbProjectSettings.runCommand,
            install: dbProjectSettings.installCommand,
        }
    };
};
exports.fromDbProjectSettings = fromDbProjectSettings;
const toDbProjectSettings = (projectId, projectSettings) => {
    return {
        projectId,
        buildCommand: projectSettings.commands.build ?? '',
        runCommand: projectSettings.commands.run ?? '',
        installCommand: projectSettings.commands.install ?? ''
    };
};
exports.toDbProjectSettings = toDbProjectSettings;
//# sourceMappingURL=settings.js.map