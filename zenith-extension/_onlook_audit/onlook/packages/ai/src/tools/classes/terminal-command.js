"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalCommandTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const type_1 = require("../shared/type");
class TerminalCommandTool extends client_1.ClientTool {
    static toolName = 'terminal_command';
    static description = 'Run any generic Linux Bash command in the terminal';
    static parameters = zod_1.z.object({
        command: zod_1.z.string().describe('The command to run'),
        branchId: type_1.BRANCH_ID_SCHEMA,
    });
    static icon = icons_1.Icons.Terminal;
    async handle(args, editorEngine) {
        const sandbox = editorEngine.branches.getSandboxById(args.branchId);
        if (!sandbox) {
            return {
                output: '',
                success: false,
                error: `Sandbox not found for branch ID: ${args.branchId}`
            };
        }
        return await sandbox.session.runCommand(args.command);
    }
    static getLabel(input) {
        return 'Terminal';
    }
}
exports.TerminalCommandTool = TerminalCommandTool;
//# sourceMappingURL=terminal-command.js.map