"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceCommand = void 0;
const shell_quote_1 = require("shell-quote");
const replaceCommand = (command, newCommand) => {
    const parsedArgs = (0, shell_quote_1.parse)(command);
    const [cmdName, ...cmdArgs] = parsedArgs;
    const packageManagers = ['npm'];
    const finalCommand = (packageManagers.includes(cmdName?.toString() || '') ? newCommand : cmdName) || '';
    // For Windows, add '&' to the command to handle special characters
    if (process.platform === 'win32') {
        return ('& ' + (0, shell_quote_1.quote)([finalCommand.toString(), ...cmdArgs.map((arg) => arg?.toString() || '')]));
    }
    return (0, shell_quote_1.quote)([finalCommand.toString(), ...cmdArgs.map((arg) => arg?.toString() || '')]);
};
exports.replaceCommand = replaceCommand;
//# sourceMappingURL=parse.js.map