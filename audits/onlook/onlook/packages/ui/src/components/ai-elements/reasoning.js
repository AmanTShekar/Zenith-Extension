"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasoningContent = exports.ReasoningTrigger = exports.Reasoning = void 0;
const react_use_controllable_state_1 = require("@radix-ui/react-use-controllable-state");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const utils_1 = require("../../utils");
const collapsible_1 = require("../collapsible");
const response_1 = require("./response");
const ReasoningContext = (0, react_1.createContext)(null);
const useReasoning = () => {
    const context = (0, react_1.useContext)(ReasoningContext);
    if (!context) {
        throw new Error('Reasoning components must be used within Reasoning');
    }
    return context;
};
const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;
exports.Reasoning = (0, react_1.memo)(({ className, isStreaming = false, open, defaultOpen = true, onOpenChange, duration: durationProp, children, ...props }) => {
    const [isOpen, setIsOpen] = (0, react_use_controllable_state_1.useControllableState)({
        prop: open,
        defaultProp: defaultOpen,
        onChange: onOpenChange,
    });
    const [duration, setDuration] = (0, react_use_controllable_state_1.useControllableState)({
        prop: durationProp,
        defaultProp: 0,
    });
    const [hasAutoClosed, setHasAutoClosed] = (0, react_1.useState)(false);
    const [startTime, setStartTime] = (0, react_1.useState)(null);
    // Track duration when streaming starts and ends
    (0, react_1.useEffect)(() => {
        if (isStreaming) {
            if (startTime === null) {
                setStartTime(Date.now());
            }
        }
        else if (startTime !== null) {
            setDuration(Math.ceil((Date.now() - startTime) / MS_IN_S));
            setStartTime(null);
        }
    }, [isStreaming, startTime, setDuration]);
    // Auto-open when streaming starts, auto-close when streaming ends (once only)
    (0, react_1.useEffect)(() => {
        if (defaultOpen && !isStreaming && isOpen && !hasAutoClosed) {
            // Add a small delay before closing to allow user to see the content
            const timer = setTimeout(() => {
                setIsOpen(false);
                setHasAutoClosed(true);
            }, AUTO_CLOSE_DELAY);
            return () => clearTimeout(timer);
        }
    }, [isStreaming, isOpen, defaultOpen, setIsOpen, hasAutoClosed]);
    const handleOpenChange = (newOpen) => {
        setIsOpen(newOpen);
    };
    return (<ReasoningContext.Provider value={{ isStreaming, isOpen, setIsOpen, duration }}>
                <collapsible_1.Collapsible className={(0, utils_1.cn)('not-prose mb-4', className)} onOpenChange={handleOpenChange} open={isOpen} {...props}>
                    {children}
                </collapsible_1.Collapsible>
            </ReasoningContext.Provider>);
});
const getThinkingMessage = (isStreaming, duration) => {
    if (isStreaming || duration === 0) {
        return <p>Reasoning...</p>;
    }
    if (duration === undefined) {
        return <p>Thought for a few seconds</p>;
    }
    return <p>Thought for {duration} seconds</p>;
};
exports.ReasoningTrigger = (0, react_1.memo)(({ className, children, ...props }) => {
    const { isStreaming, isOpen, duration } = useReasoning();
    return (<collapsible_1.CollapsibleTrigger className={(0, utils_1.cn)('flex w-full items-center gap-2 text-foreground-tertiary/80 text-xs transition-colors hover:text-foreground-tertiary', className)} {...props}>
            {children ?? (<>
                    <lucide_react_1.BrainIcon className="size-4"/>
                    {getThinkingMessage(isStreaming, duration)}
                    <lucide_react_1.ChevronDownIcon className={(0, utils_1.cn)('size-4 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')}/>
                </>)}
        </collapsible_1.CollapsibleTrigger>);
});
exports.ReasoningContent = (0, react_1.memo)(({ className, children, ...props }) => (<collapsible_1.CollapsibleContent className={(0, utils_1.cn)('mt-4 text-sm', 'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-muted-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in', className)} {...props}>
        <response_1.Response className="grid gap-2">{children}</response_1.Response>
    </collapsible_1.CollapsibleContent>));
exports.Reasoning.displayName = 'Reasoning';
exports.ReasoningTrigger.displayName = 'ReasoningTrigger';
exports.ReasoningContent.displayName = 'ReasoningContent';
//# sourceMappingURL=reasoning.js.map