"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolCallSimple = void 0;
const ai_1 = require("@onlook/ai");
const ai_elements_1 = require("@onlook/ui/ai-elements");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
const ToolCallSimpleComponent = ({ toolPart, className, loading, }) => {
    const toolName = toolPart.type.split('-')[1] ?? '';
    const ToolClass = ai_1.TOOLS_MAP.get(toolName);
    const Icon = ToolClass?.icon ?? icons_1.Icons.QuestionMarkCircled;
    const title = ToolClass ? getToolLabel(ToolClass, toolPart.input) : getDefaultToolLabel(toolName);
    return (<ai_elements_1.Tool className={className}>
            <ai_elements_1.ToolHeader loading={loading} title={title} type={toolPart.type} state={toolPart.state} icon={<Icon className="w-4 h-4 flex-shrink-0"/>}/>
            <ai_elements_1.ToolContent>
                <ai_elements_1.ToolInput input={toolPart.input} isStreaming={loading}/>
                <ai_elements_1.ToolOutput errorText={toolPart.errorText} output={toolPart.output} isStreaming={loading}/>
            </ai_elements_1.ToolContent>
        </ai_elements_1.Tool>);
};
exports.ToolCallSimple = (0, react_1.memo)(ToolCallSimpleComponent);
function getDefaultToolLabel(toolName) {
    return toolName?.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
function getToolLabel(toolClass, input) {
    try {
        return toolClass.getLabel(input);
    }
    catch (error) {
        console.error('Error getting tool label:', error);
        return getDefaultToolLabel(toolClass.name);
    }
}
//# sourceMappingURL=tool-call-simple.js.map