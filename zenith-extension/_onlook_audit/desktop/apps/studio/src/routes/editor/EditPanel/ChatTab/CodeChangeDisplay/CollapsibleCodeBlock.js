"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollapsibleCodeBlock = CollapsibleCodeBlock;
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const button_1 = require("@onlook/ui/button");
const collapsible_1 = require("@onlook/ui/collapsible");
const icons_1 = require("@onlook/ui/icons");
const utils_2 = require("@onlook/ui/utils");
const framer_motion_1 = require("framer-motion");
const react_1 = require("react");
const CodeBlock_1 = require("./CodeBlock");
const CodeModal_1 = __importDefault(require("./CodeModal"));
function CollapsibleCodeBlock({ path, content, searchContent, replaceContent, applied, isStream, onApply, onRevert, }) {
    const userManager = (0, Context_1.useUserManager)();
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [copied, setCopied] = (0, react_1.useState)(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(replaceContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const getAnimation = () => {
        if (isStream && userManager.settings.settings?.chat?.expandCodeBlocks) {
            return { height: 'auto', opacity: 1 };
        }
        return isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 };
    };
    return (<collapsible_1.Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className={(0, utils_2.cn)('border rounded-lg bg-background-primary relative', !isOpen && 'group-hover:bg-background-secondary')}>
                <div className={(0, utils_2.cn)('flex items-center justify-between text-foreground-secondary transition-colors', !isOpen && 'group-hover:text-foreground-primary')}>
                    <collapsible_1.CollapsibleTrigger asChild>
                        <div className="flex-1 flex items-center gap-2 cursor-pointer pl-3 py-2">
                            {isStream ? (<icons_1.Icons.Shadow className="h-4 w-4 animate-spin"/>) : (<icons_1.Icons.ChevronDown className={(0, utils_2.cn)('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}/>)}
                            <span className={(0, utils_2.cn)('text-small pointer-events-none select-none', isStream && 'text-shimmer')}>
                                {(0, utils_1.getTruncatedFileName)(path)}
                            </span>
                        </div>
                    </collapsible_1.CollapsibleTrigger>

                    <div className="flex items-center gap-1 pr-1 py-1">
                        {!isStream &&
            (applied ? (<button_1.Button onClick={(e) => {
                    e.stopPropagation();
                    onRevert();
                }} size="sm" variant="ghost" className="h-7 px-3 text-foreground-secondary hover:text-foreground font-sans select-none">
                                    <icons_1.Icons.Return className="h-4 w-4 mr-2"/>
                                    Revert
                                </button_1.Button>) : (<button_1.Button size="sm" variant="ghost" className="h-7 px-3 dark:text-teal-200 dark:bg-teal-900/80 dark:border-teal-600 text-teal-700 bg-teal-50 border-teal-300 border-[0.5px] dark:hover:border-teal-400 dark:hover:text-teal-100 dark:hover:bg-teal-700 hover:bg-teal-100 hover:border-teal-400 hover:text-teal-800 transition-all font-sans select-none" onClick={(e) => {
                    e.stopPropagation();
                    onApply();
                }}>
                                    <icons_1.Icons.Sparkles className="h-4 w-4 mr-2"/>
                                    Apply
                                </button_1.Button>))}
                    </div>
                </div>

                <collapsible_1.CollapsibleContent forceMount>
                    <framer_motion_1.AnimatePresence mode="wait">
                        <framer_motion_1.motion.div key="content" initial={getAnimation()} animate={getAnimation()} transition={{ duration: 0.2, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
                            <div className="border-t">
                                {isStream ? (<code className="p-4 text-xs w-full overflow-x-auto block text-foreground-secondary">
                                        {content}
                                    </code>) : (<CodeBlock_1.CodeBlock code={replaceContent} variant="minimal"/>)}
                                <div className="flex justify-end gap-1.5 p-1 border-t">
                                    <button_1.Button size="sm" variant="ghost" className="h-7 px-2 text-foreground-secondary hover:text-foreground font-sans select-none" onClick={copyToClipboard}>
                                        {copied ? (<>
                                                <icons_1.Icons.Check className="h-4 w-4 mr-2"/>
                                                Copied
                                            </>) : (<>
                                                <icons_1.Icons.Copy className="h-4 w-4 mr-2"/>
                                                Copy
                                            </>)}
                                    </button_1.Button>
                                    <CodeModal_1.default fileName={path} value={replaceContent} original={searchContent}>
                                        <button_1.Button size="sm" variant="ghost" className="h-7 px-2 text-foreground-secondary hover:text-foreground font-sans select-none">
                                            <icons_1.Icons.Code className="h-4 w-4 mr-2"/>
                                            Diffs
                                        </button_1.Button>
                                    </CodeModal_1.default>
                                </div>
                            </div>
                        </framer_motion_1.motion.div>
                    </framer_motion_1.AnimatePresence>
                </collapsible_1.CollapsibleContent>
            </div>
        </collapsible_1.Collapsible>);
}
//# sourceMappingURL=CollapsibleCodeBlock.js.map