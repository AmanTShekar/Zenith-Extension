"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const type_1 = require("../shared/type");
class SandboxTool extends client_1.ClientTool {
    static ALLOWED_SANDBOX_COMMANDS = zod_1.z.enum(['restart_dev_server', 'read_dev_server_logs']);
    static toolName = 'sandbox';
    static description = 'Execute commands in a sandboxed environment';
    static parameters = zod_1.z.object({
        command: SandboxTool.ALLOWED_SANDBOX_COMMANDS.describe('The allowed command to run'),
        branchId: type_1.BRANCH_ID_SCHEMA,
    });
    static icon = icons_1.Icons.Cube;
    async handle(args, editorEngine) {
        try {
            const sandbox = editorEngine.branches.getSandboxById(args.branchId);
            if (!sandbox) {
                throw new Error(`Sandbox not found for branch ID: ${args.branchId}`);
            }
            if (args.command === 'restart_dev_server') {
                const success = await sandbox.session.restartDevServer();
                if (success) {
                    return 'Dev server restarted';
                }
                else {
                    return 'Failed to restart dev server';
                }
            }
            else if (args.command === 'read_dev_server_logs') {
                const logs = await sandbox.session.readDevServerLogs();
                return logs;
            }
            else {
                throw new Error('Invalid command');
            }
        }
        catch (error) {
            console.error('Error handling sandbox tool:', error);
            throw new Error('Error handling sandbox tool');
        }
    }
    static getLabel(input) {
        if (input?.command) {
            return 'Sandbox: ' + input.command;
        }
        return 'Sandbox';
    }
}
exports.SandboxTool = SandboxTool;
//# sourceMappingURL=sandbox.js.map