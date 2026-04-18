"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTool = void 0;
const ai_1 = require("ai");
class BaseTool {
    static toolName;
    static description;
    static parameters;
    static icon;
    /**
     * Get the AI SDK tool definition
     */
    static getAITool() {
        return (0, ai_1.tool)({
            description: this.description,
            inputSchema: this.parameters,
        });
    }
    /**
     * Generate a dynamic label for the tool call based on input parameters
     */
    static getLabel(input) {
        return this.toolName;
    }
}
exports.BaseTool = BaseTool;
//# sourceMappingURL=base.js.map