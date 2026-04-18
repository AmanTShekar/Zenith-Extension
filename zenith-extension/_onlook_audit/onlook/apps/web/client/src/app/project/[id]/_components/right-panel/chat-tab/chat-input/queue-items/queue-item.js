"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuedMessageItem = void 0;
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const QueuedMessageItem = ({ message, removeFromQueue }) => {
    return (<div className="flex flex-row w-full py-1.5 items-center rounded-md hover:bg-background-onlook cursor-default select-none group relative transition-none overflow-hidden">
            <icons_1.Icons.ChatBubble className="flex-none mr-2 ml-3 text-muted-foreground group-hover:text-foreground"/>
            <span className="text-small truncate w-full text-left text-muted-foreground group-hover:text-foreground mr-2">
                {message.content}
            </span>
            <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                    <button_1.Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground absolute right-0 px-2.5 py-2 top-1/2 -translate-y-1/2 w-fit h-fit opacity-0 group-hover:opacity-100 !bg-background-onlook hover:!bg-background-onlook z-10 transition-none cursor-pointer" onClick={(e) => {
            e.stopPropagation();
            removeFromQueue(message.id);
        }}>
                        <icons_1.Icons.Trash className="w-4 h-4"/>
                    </button_1.Button>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipContent side="top" hideArrow>
                    <p className="font-normal">
                        Remove from queue
                    </p>
                </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>
        </div>);
};
exports.QueuedMessageItem = QueuedMessageItem;
//# sourceMappingURL=queue-item.js.map