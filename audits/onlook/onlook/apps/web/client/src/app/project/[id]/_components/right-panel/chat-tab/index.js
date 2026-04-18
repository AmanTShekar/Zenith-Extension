"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatTab = void 0;
const react_1 = require("@/trpc/react");
const index_1 = require("@onlook/ui/icons/index");
const chat_tab_content_1 = require("./chat-tab-content");
const ChatTab = ({ conversationId, projectId }) => {
    const { data: initialMessages, isLoading } = react_1.api.chat.message.getAll.useQuery({ conversationId: conversationId }, { enabled: !!conversationId });
    if (!initialMessages || isLoading) {
        return (<div className="flex-1 flex items-center justify-center w-full h-full text-foreground-secondary">
                <index_1.Icons.LoadingSpinner className="animate-spin mr-2"/>
                <p>Loading messages...</p>
            </div>);
    }
    return (<chat_tab_content_1.ChatTabContent 
    // Used to force re-render the use-chat hook when the conversationId changes
    key={conversationId} conversationId={conversationId} projectId={projectId} initialMessages={initialMessages}/>);
};
exports.ChatTab = ChatTab;
//# sourceMappingURL=index.js.map