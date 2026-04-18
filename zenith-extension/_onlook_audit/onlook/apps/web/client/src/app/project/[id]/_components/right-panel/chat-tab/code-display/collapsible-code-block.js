"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollapsibleCodeBlock = void 0;
const editor_1 = require("@/components/store/editor");
const ai_elements_1 = require("@onlook/ui/ai-elements");
const button_1 = require("@onlook/ui/button");
const collapsible_1 = require("@onlook/ui/collapsible");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const react_1 = require("motion/react");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_2 = require("react");
const CollapsibleCodeBlockComponent = ({ path, content, isStream, branchId, }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [isOpen, setIsOpen] = (0, react_2.useState)(false);
    const [copied, setCopied] = (0, react_2.useState)(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const getAnimation = () => {
        return isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 };
    };
    const branch = branchId
        ? editorEngine.branches.allBranches.find(b => b.id === branchId)
        : editorEngine.branches.activeBranch;
    return (<div className="group relative my-3">
            <collapsible_1.Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className={(0, utils_1.cn)('border rounded-lg bg-background-primary relative', !isOpen && 'group-hover:bg-background-secondary')}>
                    <div className={(0, utils_1.cn)('flex items-center justify-between text-foreground-secondary', !isOpen && 'group-hover:text-foreground-primary')}>
                        <collapsible_1.CollapsibleTrigger asChild>
                            <div className="flex-1 flex items-center gap-2 cursor-pointer pl-3 py-2">
                                {isStream ? (<icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>) : (<icons_1.Icons.ChevronDown className={(0, utils_1.cn)('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}/>)}
                                <div className={(0, utils_1.cn)('text-small pointer-events-none select-none flex items-center min-w-0 overflow-hidden', isStream && 'text-shimmer')}>
                                    <span className="truncate flex-1 min-w-0">{(0, utils_1.getTruncatedFileName)(path)}</span>
                                    {branch && (<span className="text-foreground-tertiary group-hover:text-foreground-secondary text-mini ml-0.5 flex-shrink-0 truncate max-w-24">
                                            {' • '}{branch.name}
                                        </span>)}
                                </div>
                            </div>
                        </collapsible_1.CollapsibleTrigger>
                    </div>
                    <collapsible_1.CollapsibleContent forceMount>
                        <react_1.AnimatePresence mode="wait">
                            <react_1.motion.div key="content" initial={getAnimation()} animate={getAnimation()} transition={{ duration: 0.2, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
                                {/* Only render this content when open to avoid rendering the expensive code block. */}
                                {isOpen && (<div className="border-t">
                                        <ai_elements_1.CodeBlock code={content} language="jsx" isStreaming={isStream} className="text-xs overflow-x-auto"/>
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
                                        </div>
                                    </div>)}
                            </react_1.motion.div>
                        </react_1.AnimatePresence>
                    </collapsible_1.CollapsibleContent>
                </div>
            </collapsible_1.Collapsible>
        </div>);
};
exports.CollapsibleCodeBlock = (0, react_2.memo)((0, mobx_react_lite_1.observer)(CollapsibleCodeBlockComponent));
//# sourceMappingURL=collapsible-code-block.js.map