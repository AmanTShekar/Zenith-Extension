"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSourcesDisplay = void 0;
const collapsible_1 = require("@onlook/ui/collapsible");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
exports.SearchSourcesDisplay = (0, mobx_react_lite_1.observer)(({ query, results, }) => {
    const [isOpen, setIsOpen] = (0, react_2.useState)(false);
    return (<div className="overflow-hidden">
            <collapsible_1.Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <collapsible_1.CollapsibleTrigger asChild>
                    <div className="flex items-center p-1 cursor-pointer gap-2 text-sm text-foreground-secondary">
                        <icons_1.Icons.ChevronDown className={(0, utils_1.cn)("min-w-4 h-4 w-4 text-foreground-tertiary transition-transform duration-200", isOpen && "rotate-180")}/>
                        <div className="flex flex-col">
                            <span>Searched web</span>
                            <span className="text-foreground-tertiary text-xs truncate">
                                {query}
                            </span>
                        </div>
                    </div>
                </collapsible_1.CollapsibleTrigger>
                <react_1.AnimatePresence>
                    {isOpen && (<collapsible_1.CollapsibleContent asChild>
                            <react_1.motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{
                height: { duration: 0.2 },
                opacity: { duration: 0.15 }
            }} className="overflow-hidden">
                                <div>
                                    <div className="px-2 py-1">
                                        {results.map((result, index) => (<div key={index} className="group/source">
                                                <a href={result.url} target="_blank" rel="noopener noreferrer" className="block px-2 py-1 rounded hover:bg-background-secondary/50 transition-colors">
                                                    <div className="flex items-center text-xs">
                                                        <span className="text-foreground-secondary hover:text-foreground font-medium truncate flex-shrink-0" style={{ minWidth: '120px', maxWidth: '70%' }}>
                                                            {result.title}
                                                        </span>
                                                        <span className="pl-1 text-foreground-tertiary truncate flex-1 min-w-0">
                                                            {result.url}
                                                        </span>
                                                    </div>
                                                </a>
                                            </div>))}
                                    </div>
                                </div>
                            </react_1.motion.div>
                        </collapsible_1.CollapsibleContent>)}
                </react_1.AnimatePresence>
            </collapsible_1.Collapsible>
        </div>);
});
//# sourceMappingURL=search-sources-display.js.map