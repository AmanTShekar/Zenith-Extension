"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatControls = void 0;
const editor_1 = require("@/components/store/editor");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.ChatControls = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const isStartingNewConversation = editorEngine.chat.conversation.creatingConversation;
    const isDisabled = editorEngine.chat.isStreaming || isStartingNewConversation;
    const handleNewChat = () => {
        editorEngine.chat.conversation.startNewConversation();
        editorEngine.chat.focusChatInput();
    };
    return (<div className="flex flex-row">
            <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                    <span className="inline-block">
                        <button_1.Button variant={'ghost'} size={'icon'} className="py-1 px-2 w-fit h-fit bg-transparent hover:!bg-transparent cursor-pointer group text-foreground-secondary hover:text-foreground-primary" onClick={handleNewChat} disabled={isDisabled}>
                            {isStartingNewConversation ? (<>
                                    <icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>
                                    <span className="text-small">New Chat</span>
                                </>) : (<>
                                    <icons_1.Icons.Edit className="h-4 w-4"/>
                                    <span className="text-small">New Chat</span>
                                </>)}
                        </button_1.Button>
                    </span>
                </tooltip_1.TooltipTrigger>
                {isDisabled && (<tooltip_1.TooltipContent side="bottom" hideArrow>
                        AI is still loading
                    </tooltip_1.TooltipContent>)}
            </tooltip_1.Tooltip>
        </div>);
});
//# sourceMappingURL=controls.js.map