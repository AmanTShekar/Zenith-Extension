"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlookInstructionsTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const constants_1 = require("../../prompt/constants");
const client_1 = require("../models/client");
class OnlookInstructionsTool extends client_1.ClientTool {
    static toolName = 'onlook_instructions';
    static description = 'Get Onlook-specific instructions and guidelines';
    static parameters = zod_1.z.object({});
    static icon = icons_1.Icons.OnlookLogo;
    async handle(_input, _editorEngine) {
        return constants_1.ONLOOK_INSTRUCTIONS;
    }
    static getLabel(input) {
        return 'Reading Onlook instructions';
    }
}
exports.OnlookInstructionsTool = OnlookInstructionsTool;
//# sourceMappingURL=onlook-instructions.js.map