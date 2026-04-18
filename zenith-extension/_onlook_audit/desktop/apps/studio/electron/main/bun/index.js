"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBunCommand = exports.getBunExecutablePath = void 0;
exports.runBunCommand = runBunCommand;
const child_process_1 = require("child_process");
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const index_1 = require("../index");
const storage_1 = require("../storage");
const parse_1 = require("./parse");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const getBunExecutablePath = () => {
    const arch = process.arch === 'arm64' ? 'aarch64' : process.arch;
    const isProduction = electron_1.app.isPackaged;
    const binName = process.platform === 'win32' ? `bun.exe` : `bun-${arch}`;
    const bunPath = isProduction
        ? path_1.default.join(process.resourcesPath, 'bun', binName)
        : path_1.default.join(index_1.__dirname, 'resources', 'bun', binName);
    return bunPath;
};
exports.getBunExecutablePath = getBunExecutablePath;
async function runBunCommand(command, options) {
    try {
        const commandToExecute = (0, exports.getBunCommand)(command);
        const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
        console.log('Executing command: ', commandToExecute, options.cwd);
        const { stdout, stderr } = await execAsync(commandToExecute, {
            cwd: options.cwd,
            maxBuffer: 1024 * 1024 * 10,
            env: options.env,
            shell,
        });
        console.log('Command executed with output: ', stdout);
        return { success: true, output: stdout.toString(), error: stderr.toString() };
    }
    catch (error) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
const getBunCommand = (command) => {
    const userSettings = storage_1.PersistentStorage.USER_SETTINGS.read() || {};
    const enableBunReplace = userSettings.editor?.enableBunReplace !== false;
    if (!enableBunReplace) {
        return command;
    }
    const bunExecutable = (0, exports.getBunExecutablePath)();
    return (0, parse_1.replaceCommand)(command, bunExecutable);
};
exports.getBunCommand = getBunCommand;
//# sourceMappingURL=index.js.map