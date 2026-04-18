"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueItems = void 0;
const button_1 = require("@onlook/ui/button");
const collapsible_1 = require("@onlook/ui/collapsible");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
const queue_item_1 = require("./queue-item");
const QueueItems = ({ queuedMessages: messages, removeFromQueue }) => {
    const [queueExpanded, setQueueExpanded] = (0, react_1.useState)(false);
    if (messages.length === 0)
        return null;
    return (<collapsible_1.Collapsible className="mb-2" open={queueExpanded} onOpenChange={setQueueExpanded}>
            <collapsible_1.CollapsibleTrigger asChild>
                <button_1.Button variant="ghost" className="w-full justify-start h-auto hover:bg-transparent text-muted-foreground p-2">
                    <div className="flex items-center gap-2">
                        <icons_1.Icons.ChevronDown className={`size-4 transition-transform ${queueExpanded ? 'rotate-180' : ''}`}/>
                        <span className="text-xs">
                            {messages.length} chats in queue
                        </span>
                    </div>
                </button_1.Button>
            </collapsible_1.CollapsibleTrigger>
            <collapsible_1.CollapsibleContent>
                <div className="gap-0 flex flex-col mt-1">
                    {messages.map((message, index) => (<queue_item_1.QueuedMessageItem key={message.id} message={message} index={index} removeFromQueue={removeFromQueue}/>))}
                </div>
            </collapsible_1.CollapsibleContent>
        </collapsible_1.Collapsible>);
};
exports.QueueItems = QueueItems;
//# sourceMappingURL=index.js.map