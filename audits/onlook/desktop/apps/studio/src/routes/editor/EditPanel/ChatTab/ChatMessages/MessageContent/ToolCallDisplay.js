"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolCallDisplay = void 0;
const Context_1 = require("@/components/Context");
const collapsible_1 = require("@onlook/ui/collapsible");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const framer_motion_1 = require("framer-motion");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const CodeBlock_1 = require("../../CodeChangeDisplay/CodeBlock");
exports.ToolCallDisplay = (0, mobx_react_lite_1.observer)(({ toolCall, isStream }) => {
    const userManager = (0, Context_1.useUserManager)();
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const getAnimation = () => {
        if (isStream && userManager.settings.settings?.chat?.expandCodeBlocks) {
            return { height: 'auto', opacity: 1 };
        }
        return isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 };
    };
    return (<collapsible_1.Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className={(0, utils_1.cn)('border rounded-lg bg-background-primary relative', !isOpen && 'group-hover:bg-background-secondary')}>
                    <div className={(0, utils_1.cn)('flex items-center justify-between text-foreground-secondary transition-colors', !isOpen && 'group-hover:text-foreground-primary')}>
                        <collapsible_1.CollapsibleTrigger asChild>
                            <div className="flex-1 flex items-center gap-2 cursor-pointer pl-3 py-2">
                                <icons_1.Icons.ChevronDown className={(0, utils_1.cn)('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}/>
                                <span className={(0, utils_1.cn)('text-small pointer-events-none select-none', isStream && 'text-shimmer')}>
                                    Used tool
                                </span>
                            </div>
                        </collapsible_1.CollapsibleTrigger>

                        <div className="flex items-center mr-2 px-2 py-0 border rounded-md bg-background-secondary">
                            {toolCall.toolName}
                        </div>
                    </div>

                    <collapsible_1.CollapsibleContent forceMount>
                        <framer_motion_1.AnimatePresence mode="wait">
                            <framer_motion_1.motion.div key="content" initial={getAnimation()} animate={getAnimation()} transition={{ duration: 0.2, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
                                <div className="border-t">
                                    <CodeBlock_1.CodeBlock code={JSON.stringify(toolCall.args, null, 2)} variant="minimal"/>
                                </div>
                            </framer_motion_1.motion.div>
                        </framer_motion_1.AnimatePresence>
                    </collapsible_1.CollapsibleContent>
                </div>
            </collapsible_1.Collapsible>);
});
//# sourceMappingURL=ToolCallDisplay.js.map