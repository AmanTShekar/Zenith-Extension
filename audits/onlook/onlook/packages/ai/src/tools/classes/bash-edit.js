"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BashEditTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const type_1 = require("../shared/type");
class BashEditTool extends client_1.ClientTool {
    static ALLOWED_BASH_EDIT_COMMANDS = zod_1.z.enum([
        'mkdir',
        'rm',
        'rmdir',
        'mv',
        'cp',
        'touch',
        'chmod',
        'chown',
        'ln',
        'git',
    ]);
    static toolName = 'bash_edit';
    static description = 'Execute bash commands for file editing and system operations';
    static parameters = zod_1.z.object({
        command: zod_1.z
            .string()
            .describe('The command to execute that modifies files (mkdir, rm, mv, cp, chmod, etc.)'),
        allowed_commands: zod_1.z
            .array(BashEditTool.ALLOWED_BASH_EDIT_COMMANDS)
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
    static icon = icons_1.Icons.Terminal;
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
            const editCommands = args.allowed_commands || BashEditTool.ALLOWED_BASH_EDIT_COMMANDS.options;
            const commandParts = args.command.trim().split(/\s+/);
            const baseCommand = commandParts[0] || '';
            const isEditCommand = editCommands.some((cmd) => baseCommand.includes(cmd));
            if (!isEditCommand) {
                return {
                    output: '',
                    success: false,
                    error: `Command '${baseCommand}' is not allowed in edit mode. Only ${editCommands.join(', ')} commands are permitted.`
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
            return 'Running command ' + (input.command.split('/').pop() || '');
        }
        else {
            return 'Running command';
        }
    }
}
exports.BashEditTool = BashEditTool;
//# sourceMappingURL=bash-edit.js.map