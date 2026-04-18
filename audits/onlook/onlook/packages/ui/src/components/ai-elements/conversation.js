"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationScrollButton = exports.ConversationEmptyState = exports.ConversationContent = exports.Conversation = void 0;
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const use_stick_to_bottom_1 = require("use-stick-to-bottom");
const utils_1 = require("../../utils");
const button_1 = require("../button");
const Conversation = ({ className, ...props }) => (<use_stick_to_bottom_1.StickToBottom className={(0, utils_1.cn)('relative flex-1 overflow-y-auto', className)} initial="smooth" resize="smooth" role="log" {...props}/>);
exports.Conversation = Conversation;
const ConversationContent = ({ className, ...props }) => (<use_stick_to_bottom_1.StickToBottom.Content className={(0, utils_1.cn)('p-4', className)} {...props}/>);
exports.ConversationContent = ConversationContent;
const ConversationEmptyState = ({ className, title = 'No messages yet', description = 'Start a conversation to see messages here', icon, children, ...props }) => (<div className={(0, utils_1.cn)('flex size-full flex-col items-center justify-center gap-3 p-8 text-center', className)} {...props}>
        {children ?? (<>
                {icon && <div className="text-muted-foreground">{icon}</div>}
                <div className="space-y-1">
                    <h3 className="font-medium text-sm">{title}</h3>
                    {description && <p className="text-muted-foreground text-sm">{description}</p>}
                </div>
            </>)}
    </div>);
exports.ConversationEmptyState = ConversationEmptyState;
const ConversationScrollButton = ({ className, ...props }) => {
    const { isAtBottom, scrollToBottom } = (0, use_stick_to_bottom_1.useStickToBottomContext)();
    const handleScrollToBottom = (0, react_1.useCallback)(() => {
        scrollToBottom();
    }, [scrollToBottom]);
    return (!isAtBottom && (<button_1.Button className={(0, utils_1.cn)('absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full bg-background-onlook/20 backdrop-blur-lg text-foreground-onlook opacity-100 hover:bg-foreground-primary hover:text-background-onlook border-[0.5px] border-foreground-primary/20', className)} onClick={handleScrollToBottom} size="icon" type="button" variant="default" {...props}>
                <lucide_react_1.ArrowDownIcon className="size-4"/>
            </button_1.Button>));
};
exports.ConversationScrollButton = ConversationScrollButton;
//# sourceMappingURL=conversation.js.map