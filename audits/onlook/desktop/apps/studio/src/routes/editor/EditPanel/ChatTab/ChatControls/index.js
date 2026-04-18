"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatControls = void 0;
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const react_tooltip_1 = require("@radix-ui/react-tooltip");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.ChatControls = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const handleNewChat = () => {
        editorEngine.chat.conversation.startNewConversation();
        editorEngine.chat.focusChatInput();
    };
    return (<div className="flex flex-row opacity-0 transition-opacity duration-200 group-hover/panel:opacity-100">
            <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                    <button_1.Button variant={'ghost'} size={'icon'} className="p-2 w-fit h-fit hover:bg-background-onlook" onClick={handleNewChat} disabled={editorEngine.chat.isWaiting}>
                        <icons_1.Icons.Plus />
                    </button_1.Button>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipContent side="bottom">
                    <p>New Chat</p>
                    <react_tooltip_1.TooltipArrow className="fill-foreground"/>
                </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>
        </div>);
});
//# sourceMappingURL=index.js.map