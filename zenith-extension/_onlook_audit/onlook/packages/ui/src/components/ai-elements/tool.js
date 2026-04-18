"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolOutput = exports.ToolInput = exports.ToolContent = exports.ToolHeader = exports.Tool = void 0;
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const badge_1 = require("../../components/badge");
const collapsible_1 = require("../../components/collapsible");
const index_1 = require("../../utils/index");
const code_block_1 = require("./code-block");
const Tool = ({ className, ...props }) => (<collapsible_1.Collapsible className={(0, index_1.cn)('flex flex-col text-foreground-tertiary/80 p-0 my-2', className)} {...props}/>);
exports.Tool = Tool;
const getStatusBadge = (status, showLabel = false) => {
    const labels = {
        'input-streaming': 'Pending',
        'input-available': 'Running',
        'output-available': 'Completed',
        'output-error': 'Error',
    };
    const icons = {
        'input-streaming': <lucide_react_1.CircleIcon className="size-4"/>,
        'input-available': <lucide_react_1.ClockIcon className="size-4 animate-pulse"/>,
        'output-available': <lucide_react_1.CheckCircleIcon className="size-4 text-green-600"/>,
        'output-error': <lucide_react_1.XCircleIcon className="size-4 text-red-600"/>,
    };
    return (<badge_1.Badge className="gap-1.5 rounded-full text-xs" variant="outline">
            {icons[status]}
            {showLabel && labels[status]}
        </badge_1.Badge>);
};
const ToolHeader = ({ className, type, state, icon, title, loading, showStatus = false, ...props }) => (<collapsible_1.CollapsibleTrigger className={(0, index_1.cn)('flex w-full items-center justify-between gap-4', className)} {...props}>
        <div className="flex items-center gap-2">
            {icon ? icon : <lucide_react_1.WrenchIcon className="size-4 text-muted-foreground"/>}
            <span className={(0, index_1.cn)('text-regularPlus hover:text-foreground-tertiary truncate', loading &&
        'bg-gradient-to-l from-white/20 via-white/90 to-white/20 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer filter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]')}>
                {title ? title : type}
            </span>
            {showStatus && getStatusBadge(state)}
        </div>
    </collapsible_1.CollapsibleTrigger>);
exports.ToolHeader = ToolHeader;
const ToolContent = ({ className, ...props }) => (<collapsible_1.CollapsibleContent className={(0, index_1.cn)('text-xs data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in', className)} {...props}/>);
exports.ToolContent = ToolContent;
const ToolInputComponent = ({ className, input, isStreaming, ...props }) => (<div className={(0, index_1.cn)('space-y-2 overflow-hidden p-1', className)} {...props}>
        <h4 className="font-medium text-muted-foreground text-xs capitalize tracking-wide">
            Parameters
        </h4>
        <code_block_1.CodeBlock className="p-0 m-0" code={JSON.stringify(input, null, 2)} language="json" isStreaming={isStreaming}/>
    </div>);
exports.ToolInput = (0, react_1.memo)(ToolInputComponent);
const ToolOutputComponent = ({ className, output, errorText, isStreaming, ...props }) => {
    if (!(output || errorText)) {
        return null;
    }
    let Output = <div>{output}</div>;
    if (typeof output === 'object') {
        Output = <code_block_1.CodeBlock code={JSON.stringify(output, null, 2)} language="json" isStreaming={isStreaming}/>;
    }
    else if (typeof output === 'string') {
        Output = <code_block_1.CodeBlock code={output} language="json" isStreaming={isStreaming}/>;
    }
    return (<div className={(0, index_1.cn)('space-y-2 p-1', className)} {...props}>
            <h4 className="font-medium text-muted-foreground text-xs capitalize tracking-wide">
                {errorText ? 'Error' : 'Result'}
            </h4>
            <div className={(0, index_1.cn)('overflow-x-auto rounded-md text-xs [&_table]:w-full', errorText
            ? 'bg-destructive/10 text-destructive'
            : 'bg-muted/50 text-foreground')}>
                {errorText && <div>{errorText}</div>}
                {Output}
            </div>
        </div>);
};
exports.ToolOutput = (0, react_1.memo)(ToolOutputComponent);
//# sourceMappingURL=tool.js.map