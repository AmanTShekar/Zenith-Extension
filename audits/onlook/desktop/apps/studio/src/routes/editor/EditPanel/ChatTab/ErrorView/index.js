"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorView = void 0;
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const collapsible_1 = require("@onlook/ui/collapsible");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const framer_motion_1 = require("framer-motion");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
exports.ErrorView = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const errorCount = editorEngine.errors.errors.length;
    return (<collapsible_1.Collapsible open={isOpen} onOpenChange={setIsOpen} className={(0, utils_1.cn)('flex flex-col m-2', errorCount === 0 && 'hidden', !editorEngine.errors.shouldShowErrors && 'hidden')}>
            <div className={(0, utils_1.cn)('border rounded-lg bg-amber-100 dark:bg-amber-950 relative border-amber-200 dark:border-amber-500/20', !isOpen && 'hover:bg-amber-50 dark:hover:bg-amber-900')}>
                <div className={(0, utils_1.cn)('flex items-center justify-between text-amber-800 dark:text-amber-200 transition-colors', !isOpen && 'hover:text-amber-600 dark:hover:text-amber-400')}>
                    <collapsible_1.CollapsibleTrigger asChild disabled={errorCount === 1}>
                        <div className="flex-1 flex items-center gap-2 cursor-pointer pl-3 py-2 min-w-0">
                            <icons_1.Icons.ChevronDown className={(0, utils_1.cn)('h-4 w-4 shrink-0 transition-transform duration-200 text-amber-600 dark:text-amber-400', isOpen && 'rotate-180')}/>
                            <div className="text-start min-w-0 flex-1">
                                <div className="text-amber-800 dark:text-amber-200 truncate text-small pointer-events-none select-none">
                                    {errorCount === 1 ? 'Error' : `${errorCount} Errors`}
                                </div>
                                <div className="text-amber-800 dark:text-yellow-200 hidden truncate text-small pointer-events-none select-none max-w-[300px]">
                                    {errorCount === 1
            ? editorEngine.errors.errors[0].content
            : `You have ${errorCount} errors`}
                                </div>
                            </div>
                        </div>
                    </collapsible_1.CollapsibleTrigger>
                    <div className="flex items-center gap-1 pr-1 py-1 shrink-0">
                        <button_1.Button variant="ghost" size="sm" disabled={editorEngine.chat.isWaiting} className="h-7 px-2 text-amber-600 dark:text-amber-400 hover:text-amber-900 hover:bg-amber-200 dark:hover:text-amber-100 dark:hover:bg-amber-700 font-sans select-none" onClick={(e) => {
            e.stopPropagation();
            editorEngine.errors.sendFixError();
        }}>
                            <icons_1.Icons.MagicWand className="h-4 w-4 mr-2"/>
                            Fix
                        </button_1.Button>
                    </div>
                </div>
                <collapsible_1.CollapsibleContent forceMount>
                    <framer_motion_1.AnimatePresence mode="wait">
                        <framer_motion_1.motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }} style={{ overflow: 'hidden' }} className="border-t border-amber-200/20 dark:border-amber-500/20">
                            <div className="px-2.5 py-2 max-h-60 overflow-auto">
                                {editorEngine.errors.errors.map((error) => (<div key={error.content} className="mb-3 last:mb-0 font-mono">
                                        <div className="text-miniPlus text-amber-800/80 dark:text-amber-200/80 mb-1 truncate">
                                            {error.sourceId}
                                        </div>
                                        <div className="text-micro text-amber-800/60 dark:text-amber-200/60">
                                            {error.content}
                                        </div>
                                    </div>))}
                            </div>
                        </framer_motion_1.motion.div>
                    </framer_motion_1.AnimatePresence>
                </collapsible_1.CollapsibleContent>
            </div>
        </collapsible_1.Collapsible>);
});
//# sourceMappingURL=index.js.map