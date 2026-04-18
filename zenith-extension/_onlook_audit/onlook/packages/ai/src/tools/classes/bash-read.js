"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BashReadTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const type_1 = require("../shared/type");
class BashReadTool extends client_1.ClientTool {
    static ALLOWED_BASH_READ_COMMANDS = zod_1.z.enum([
        'ls',
        'cat',
        'head',
        'tail',
        'grep',
        'find',
        'wc',
        'sort',
        'uniq',
        'du',
        'df',
        'ps',
        'top',
        'which',
        'whereis',
    ]);
    static toolName = 'bash_read';
    static description = 'Execute safe read-only bash commands';
    static parameters = zod_1.z.object({
        command: zod_1.z
            .string()
            .describe('The read-only command to execute (no file modifications allowed)'),
        allowed_commands: zod_1.z
            .array(BashReadTool.ALLOWED_BASH_READ_COMMANDS)
            .optional()
            .describe('Override allowed commands for this execution'),
        description: zod_1.z
            .string()
            .optional()
            .describe('Clear, concise description of what this command does in 5-10 words'),
        timeout: zod_1.z
            .number()
            .max(600000)
            .optional()
            .describe('Optional timeout in milliseconds (up to 600000ms / 10 minutes)'),
        branchId: type_1.BRANCH_ID_SCHEMA,
    });
    static icon = icons_1.Icons.EyeOpen;
    async handle(args, editorEngine) {
        try {
            const sandbox = editorEngine.branches.getSandboxById(args.branchId);
            if (!sandbox) {
                return {
                    output: '',
                    success: false,
                    error: `Sandbox not found for branch ID: ${args.branchId}`
                };
            }
            // Use allowed commands from parameter or default to all enum values
            const readOnlyCommands = args.allowed_commands || BashReadTool.ALLOWED_BASH_READ_COMMANDS.options;
            const commandParts = args.command.trim().split(/\s+/);
            const baseCommand = commandParts[0] || '';
            if (!readOnlyCommands.some((cmd) => baseCommand.includes(cmd))) {
                return {
                    output: '',
                    success: false,
                    error: `Command '${baseCommand}' is not allowed in read-only mode. Only ${readOnlyCommands.join(', ')} commands are permitted.`
                };
            }
            const result = await sandbox.session.runCommand(args.command);
            return {
                output: result.output,
                success: result.success,
                error: result.error
            };
        }
        catch (error) {
            return {
                output: '',
                success: false,
                error: error.message || error.toString()
            };
        }
    }
    static getLabel(input) {
        if (input?.command) {
            return 'Reading with ' + (input.command.split(' ')[0] || '');
        }
        return 'Reading with bash';
    }
}
exports.BashReadTool = BashReadTool;
//# sourceMappingURL=bash-read.js.map