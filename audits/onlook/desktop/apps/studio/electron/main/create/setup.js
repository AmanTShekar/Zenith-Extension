"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reinstallProjectDependencies = exports.installProjectDependencies = void 0;
const models_1 = require("@onlook/models");
const bun_1 = require("../bun");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const installProjectDependencies = async (targetPath, installCommand, onProgress) => {
    try {
        onProgress(models_1.SetupStage.INSTALLING, 'Installing required packages...');
        const result = await (0, bun_1.runBunCommand)(installCommand, {
            cwd: targetPath,
        });
        if (!result.success) {
            throw new Error(`Failed to install dependencies: ${result.error}`);
        }
        onProgress(models_1.SetupStage.COMPLETE, 'Project dependencies installed.');
    }
    catch (err) {
        console.error(err);
        onProgress(models_1.SetupStage.ERROR, err instanceof Error ? err.message : 'An unknown error occurred.');
    }
};
exports.installProjectDependencies = installProjectDependencies;
const reinstallProjectDependencies = async (targetPath, installCommand, onProgress) => {
    try {
        onProgress(models_1.SetupStage.INSTALLING, 'Cleaning up previous dependencies...');
        const nodeModulesPath = path_1.default.join(targetPath, 'node_modules');
        if (fs_1.default.existsSync(nodeModulesPath)) {
            await fs_1.default.promises.rm(nodeModulesPath, { recursive: true, force: true });
        }
        const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'];
        for (const lockFile of lockFiles) {
            const lockPath = path_1.default.join(targetPath, lockFile);
            if (fs_1.default.existsSync(lockPath)) {
                await fs_1.default.promises.unlink(lockPath);
            }
        }
        onProgress(models_1.SetupStage.INSTALLING, 'Reinstalling packages...');
        const result = await (0, bun_1.runBunCommand)(installCommand, {
            cwd: targetPath,
        });
        if (!result.success) {
            throw new Error(`Failed to reinstall dependencies: ${result.error}`);
        }
        onProgress(models_1.SetupStage.COMPLETE, 'Project dependencies reinstalled successfully.');
    }
    catch (err) {
        console.error(err);
        onProgress(models_1.SetupStage.ERROR, err instanceof Error ? err.message : 'An unknown error occurred during reinstallation.');
    }
};
exports.reinstallProjectDependencies = reinstallProjectDependencies;
//# sourceMappingURL=setup.js.map