"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextCacheUsage = exports.ContextReasoningUsage = exports.ContextOutputUsage = exports.ContextInputUsage = exports.ContextContentFooter = exports.ContextContentBody = exports.ContextContentHeader = exports.ContextContent = exports.ContextTrigger = exports.Context = void 0;
const react_1 = require("react");
const tokenlens_1 = require("tokenlens");
const button_1 = require("../../components/button");
const hover_card_1 = require("../../components/hover-card");
const progress_1 = require("../../components/progress");
const utils_1 = require("../../utils");
const PERCENT_MAX = 100;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const pct = (used, max) => (max > 0 ? clamp01(used / max) : 0);
const ICON_RADIUS = 10;
const ICON_VIEWBOX = 24;
const ICON_CENTER = 12;
const ICON_STROKE_WIDTH = 2;
const ContextContext = (0, react_1.createContext)(null);
const useContextValue = () => {
    const context = (0, react_1.useContext)(ContextContext);
    if (!context) {
        throw new Error('Context components must be used within Context');
    }
    return context;
};
const Context = ({ usedTokens, maxTokens, usage, modelId, ...props }) => (<ContextContext.Provider value={{
        usedTokens,
        maxTokens,
        usage,
        modelId,
    }}>
        <hover_card_1.HoverCard closeDelay={0} openDelay={0} {...props}/>
    </ContextContext.Provider>);
exports.Context = Context;
const ContextIcon = () => {
    const { usedTokens, maxTokens } = useContextValue();
    const circumference = 2 * Math.PI * ICON_RADIUS;
    const usedPercent = pct(usedTokens, maxTokens);
    const dashOffset = circumference * (1 - usedPercent);
    return (<svg aria-label="Model context usage" height="20" role="img" style={{ color: 'currentcolor' }} viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`} width="20">
            <circle cx={ICON_CENTER} cy={ICON_CENTER} fill="none" opacity="0.25" r={ICON_RADIUS} stroke="currentColor" strokeWidth={ICON_STROKE_WIDTH}/>
            <circle cx={ICON_CENTER} cy={ICON_CENTER} fill="none" opacity="0.7" r={ICON_RADIUS} stroke="currentColor" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round" strokeWidth={ICON_STROKE_WIDTH} style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}/>
        </svg>);
};
const ContextTrigger = ({ children, ...props }) => {
    const { usedTokens, maxTokens } = useContextValue();
    const usedPercent = pct(usedTokens, maxTokens);
    const renderedPercent = new Intl.NumberFormat('en-US', {
        style: 'percent',
        maximumFractionDigits: 0,
    }).format(usedPercent);
    return (<hover_card_1.HoverCardTrigger asChild>
            {children ?? (<button_1.Button type="button" variant="ghost" {...props}>
                    <ContextIcon />
                    <span className="text-xs font-medium text-muted-foreground">
                        {renderedPercent}
                    </span>
                </button_1.Button>)}
        </hover_card_1.HoverCardTrigger>);
};
exports.ContextTrigger = ContextTrigger;
const ContextContent = ({ className, ...props }) => (<hover_card_1.HoverCardContent className={(0, utils_1.cn)('min-w-[240px] divide-y overflow-hidden p-0', className)} {...props}/>);
exports.ContextContent = ContextContent;
const ContextContentHeader = ({ children, className, ...props }) => {
    const { usedTokens, maxTokens } = useContextValue();
    const usedPercent = pct(usedTokens, maxTokens);
    const displayPct = new Intl.NumberFormat('en-US', {
        style: 'percent',
        maximumFractionDigits: 1,
    }).format(usedPercent);
    const used = new Intl.NumberFormat('en-US', {
        notation: 'compact',
    }).format(usedTokens);
    const total = new Intl.NumberFormat('en-US', {
        notation: 'compact',
    }).format(maxTokens);
    return (<div className={(0, utils_1.cn)('w-full space-y-2 p-3', className)} {...props}>
            {children ?? (<>
                    <div className="flex items-center justify-between gap-3 text-xs">
                        <p>{displayPct}</p>
                        <p className="font-mono text-muted-foreground">
                            {used} / {total}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <progress_1.Progress className="bg-muted" value={Math.round(usedPercent * PERCENT_MAX)}/>
                    </div>
                </>)}
        </div>);
};
exports.ContextContentHeader = ContextContentHeader;
const ContextContentBody = ({ children, className, ...props }) => (<div className={(0, utils_1.cn)('w-full p-3', className)} {...props}>
        {children}
    </div>);
exports.ContextContentBody = ContextContentBody;
const ContextContentFooter = ({ children, className, ...props }) => {
    const { modelId, usage } = useContextValue();
    const costUSD = modelId
        ? (0, tokenlens_1.estimateCost)({
            modelId,
            usage: {
                input: usage?.inputTokens ?? 0,
                output: usage?.outputTokens ?? 0,
            },
        }).totalUSD
        : undefined;
    const totalCost = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(costUSD ?? 0);
    return (<div className={(0, utils_1.cn)('flex w-full items-center justify-between gap-3 bg-secondary p-3 text-xs', className)} {...props}>
            {children ?? (<>
                    <span className="text-muted-foreground">Total cost</span>
                    <span>{totalCost}</span>
                </>)}
        </div>);
};
exports.ContextContentFooter = ContextContentFooter;
const ContextInputUsage = ({ className, children, ...props }) => {
    const { usage, modelId } = useContextValue();
    const inputTokens = usage?.inputTokens ?? 0;
    if (children) {
        return children;
    }
    if (!inputTokens) {
        return null;
    }
    const inputCost = modelId
        ? (0, tokenlens_1.estimateCost)({
            modelId,
            usage: { input: inputTokens, output: 0 },
        }).totalUSD
        : undefined;
    const inputCostText = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(inputCost ?? 0);
    return (<div className={(0, utils_1.cn)('flex items-center justify-between text-xs', className)} {...props}>
            <span className="text-muted-foreground">Input</span>
            <TokensWithCost costText={inputCostText} tokens={inputTokens}/>
        </div>);
};
exports.ContextInputUsage = ContextInputUsage;
const ContextOutputUsage = ({ className, children, ...props }) => {
    const { usage, modelId } = useContextValue();
    const outputTokens = usage?.outputTokens ?? 0;
    if (children) {
        return children;
    }
    if (!outputTokens) {
        return null;
    }
    const outputCost = modelId
        ? (0, tokenlens_1.estimateCost)({
            modelId,
            usage: { input: 0, output: outputTokens },
        }).totalUSD
        : undefined;
    const outputCostText = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(outputCost ?? 0);
    return (<div className={(0, utils_1.cn)('flex items-center justify-between text-xs', className)} {...props}>
            <span className="text-muted-foreground">Output</span>
            <TokensWithCost costText={outputCostText} tokens={outputTokens}/>
        </div>);
};
exports.ContextOutputUsage = ContextOutputUsage;
const ContextReasoningUsage = ({ className, children, ...props }) => {
    const { usage, modelId } = useContextValue();
    const reasoningTokens = usage?.reasoningTokens ?? 0;
    if (children) {
        return children;
    }
    if (!reasoningTokens) {
        return null;
    }
    const reasoningCost = modelId
        ? (0, tokenlens_1.estimateCost)({
            modelId,
            usage: { reasoningTokens },
        }).totalUSD
        : undefined;
    const reasoningCostText = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(reasoningCost ?? 0);
    return (<div className={(0, utils_1.cn)('flex items-center justify-between text-xs', className)} {...props}>
            <span className="text-muted-foreground">Reasoning</span>
            <TokensWithCost costText={reasoningCostText} tokens={reasoningTokens}/>
        </div>);
};
exports.ContextReasoningUsage = ContextReasoningUsage;
const ContextCacheUsage = ({ className, children, ...props }) => {
    const { usage, modelId } = useContextValue();
    const cacheTokens = usage?.cachedInputTokens ?? 0;
    if (children) {
        return children;
    }
    if (!cacheTokens) {
        return null;
    }
    const cacheCost = modelId
        ? (0, tokenlens_1.estimateCost)({
            modelId,
            usage: { cacheReads: cacheTokens, input: 0, output: 0 },
        }).totalUSD
        : undefined;
    const cacheCostText = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cacheCost ?? 0);
    return (<div className={(0, utils_1.cn)('flex items-center justify-between text-xs', className)} {...props}>
            <span className="text-muted-foreground">Cache</span>
            <TokensWithCost costText={cacheCostText} tokens={cacheTokens}/>
        </div>);
};
exports.ContextCacheUsage = ContextCacheUsage;
const TokensWithCost = ({ tokens, costText, showCost = false, }) => {
    return (<span>
            {tokens === undefined
            ? '—'
            : new Intl.NumberFormat('en-US', {
                notation: 'compact',
            }).format(tokens)}
            {showCost && costText ? (<span className="ml-2 text-muted-foreground">• {costText}</span>) : null}
        </span>);
};
//# sourceMappingURL=context.js.map