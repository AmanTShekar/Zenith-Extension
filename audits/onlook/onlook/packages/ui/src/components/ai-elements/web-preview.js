"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebPreviewConsole = exports.WebPreviewBody = exports.WebPreviewUrl = exports.WebPreviewNavigationButton = exports.WebPreviewNavigation = exports.WebPreview = void 0;
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const button_1 = require("../../components/button");
const collapsible_1 = require("../../components/collapsible");
const input_1 = require("../../components/input");
const tooltip_1 = require("../../components/tooltip");
const index_1 = require("../../utils/index");
const WebPreviewContext = (0, react_1.createContext)(null);
const useWebPreview = () => {
    const context = (0, react_1.useContext)(WebPreviewContext);
    if (!context) {
        throw new Error('WebPreview components must be used within a WebPreview');
    }
    return context;
};
const WebPreview = ({ className, children, defaultUrl = '', onUrlChange, ...props }) => {
    const [url, setUrl] = (0, react_1.useState)(defaultUrl);
    const [consoleOpen, setConsoleOpen] = (0, react_1.useState)(false);
    const handleUrlChange = (newUrl) => {
        setUrl(newUrl);
        onUrlChange?.(newUrl);
    };
    const contextValue = {
        url,
        setUrl: handleUrlChange,
        consoleOpen,
        setConsoleOpen,
    };
    return (<WebPreviewContext.Provider value={contextValue}>
            <div className={(0, index_1.cn)('flex size-full flex-col rounded-lg border bg-card', className)} {...props}>
                {children}
            </div>
        </WebPreviewContext.Provider>);
};
exports.WebPreview = WebPreview;
const WebPreviewNavigation = ({ className, children, ...props }) => (<div className={(0, index_1.cn)('flex items-center gap-1 border-b p-2', className)} {...props}>
        {children}
    </div>);
exports.WebPreviewNavigation = WebPreviewNavigation;
const WebPreviewNavigationButton = ({ onClick, disabled, tooltip, children, ...props }) => (<tooltip_1.TooltipProvider>
        <tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
                <button_1.Button className="h-8 w-8 p-0 hover:text-foreground" disabled={disabled} onClick={onClick} size="sm" variant="ghost" {...props}>
                    {children}
                </button_1.Button>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent>
                <p>{tooltip}</p>
            </tooltip_1.TooltipContent>
        </tooltip_1.Tooltip>
    </tooltip_1.TooltipProvider>);
exports.WebPreviewNavigationButton = WebPreviewNavigationButton;
const WebPreviewUrl = ({ value, onChange, onKeyDown, ...props }) => {
    const { url, setUrl } = useWebPreview();
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            const target = event.target;
            setUrl(target.value);
        }
        onKeyDown?.(event);
    };
    return (<input_1.Input className="h-8 flex-1 text-sm" onChange={onChange} onKeyDown={handleKeyDown} placeholder="Enter URL..." value={value ?? url} {...props}/>);
};
exports.WebPreviewUrl = WebPreviewUrl;
const WebPreviewBody = ({ className, loading, src, ...props }) => {
    const { url } = useWebPreview();
    return (<div className="flex-1">
            <iframe className={(0, index_1.cn)('size-full', className)} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation" src={(src ?? url) || undefined} title="Preview" {...props}/>
            {loading}
        </div>);
};
exports.WebPreviewBody = WebPreviewBody;
const WebPreviewConsole = ({ className, logs = [], children, ...props }) => {
    const { consoleOpen, setConsoleOpen } = useWebPreview();
    return (<collapsible_1.Collapsible className={(0, index_1.cn)('border-t bg-muted/50 font-mono text-sm', className)} onOpenChange={setConsoleOpen} open={consoleOpen} {...props}>
            <collapsible_1.CollapsibleTrigger asChild>
                <button_1.Button className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50" variant="ghost">
                    Console
                    <lucide_react_1.ChevronDownIcon className={(0, index_1.cn)('h-4 w-4 transition-transform duration-200', consoleOpen && 'rotate-180')}/>
                </button_1.Button>
            </collapsible_1.CollapsibleTrigger>
            <collapsible_1.CollapsibleContent className={(0, index_1.cn)('px-4 pb-4', 'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in')}>
                <div className="max-h-48 space-y-1 overflow-y-auto">
                    {logs.length === 0 ? (<p className="text-muted-foreground">No console output</p>) : (logs.map((log, index) => (<div className={(0, index_1.cn)('text-xs', log.level === 'error' && 'text-destructive', log.level === 'warn' && 'text-yellow-600', log.level === 'log' && 'text-foreground')} key={`${log.timestamp.getTime()}-${index}`}>
                                <span className="text-muted-foreground">
                                    {log.timestamp.toLocaleTimeString()}
                                </span>{' '}
                                {log.message}
                            </div>)))}
                    {children}
                </div>
            </collapsible_1.CollapsibleContent>
        </collapsible_1.Collapsible>);
};
exports.WebPreviewConsole = WebPreviewConsole;
//# sourceMappingURL=web-preview.js.map