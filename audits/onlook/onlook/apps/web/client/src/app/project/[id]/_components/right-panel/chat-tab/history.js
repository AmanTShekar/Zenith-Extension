"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHistory = void 0;
const editor_1 = require("@/components/store/editor");
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const popover_1 = require("@onlook/ui/popover");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
exports.ChatHistory = (0, mobx_react_lite_1.observer)(({ isOpen, onOpenChange }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [showDeleteDialog, setShowDeleteDialog] = (0, react_1.useState)(false);
    const [conversationToDelete, setConversationToDelete] = (0, react_1.useState)(null);
    const handlePopoverOpenChange = (open) => {
        if (!showDeleteDialog) {
            onOpenChange(open);
        }
    };
    const handleDeleteConversation = () => {
        if (conversationToDelete) {
            editorEngine.chat.conversation.deleteConversation(conversationToDelete);
            setShowDeleteDialog(false);
            setConversationToDelete(null);
        }
    };
    const groups = [{ name: 'Today' }];
    // Sort conversations by creation time, newest first
    const sortedConversations = [...editorEngine.chat.conversation.conversations].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return (<popover_1.Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
            <popover_1.PopoverAnchor className="absolute -left-2 top-0"/>
            <popover_1.PopoverContent side="left" align="start" className="rounded-xl p-0">
                <div className="flex flex-col select-none">
                    <div className="border-b">
                        <div className="flex flex-row justify-between items-center p-1 h-fit text-xs text-foreground-tertiary">
                            <span className="px-2">Chat History</span>
                            <button_1.Button variant={'ghost'} size={'icon'} className="p-2 w-fit hover:bg-transparent" onClick={() => onOpenChange(false)}>
                                <icons_1.Icons.CrossL />
                            </button_1.Button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 p-2 text-foreground-tertiary">
                        <div className="flex flex-col">
                            {groups.map((group) => (<div className="flex flex-col gap-1" key={group.name}>
                                    <span className="text-[0.7rem] px-2">{group.name}</span>
                                    <div className="flex flex-col">
                                        {sortedConversations.map((conversation) => (<div className={(0, utils_1.cn)('flex flex-row w-full py-2 items-center rounded-md hover:bg-background-onlook cursor-pointer select-none group relative', conversation.id ===
                    editorEngine.chat.conversation.current?.id &&
                    'bg-background-onlook text-primary font-semibold')} key={conversation.id} onClick={() => editorEngine.chat.conversation.selectConversation(conversation.id)}>
                                                <icons_1.Icons.ChatBubble className="flex-none mx-2"/>
                                                <span className="text-xs truncate w-80 text-left">
                                                    {conversation.title ?? 'New Conversation'}
                                                </span>
                                                <tooltip_1.Tooltip>
                                                    <tooltip_1.TooltipTrigger asChild>
                                                        <button_1.Button variant={'ghost'} size={'icon'} className="absolute right-0 px-2.5 py-2 top-1/2 -translate-y-1/2 w-fit h-fit opacity-0 group-hover:opacity-100 group-hover:bg-background-primary hover:bg-background-tertiary z-10" onClick={(e) => {
                    e.stopPropagation();
                    setConversationToDelete(conversation.id);
                    setShowDeleteDialog(true);
                }}>
                                                            <icons_1.Icons.Trash className="w-4 h-4"/>
                                                        </button_1.Button>
                                                    </tooltip_1.TooltipTrigger>
                                                    <tooltip_1.TooltipContent side="right">
                                                        <p className="font-normal">
                                                            Delete Conversation
                                                        </p>
                                                    </tooltip_1.TooltipContent>
                                                </tooltip_1.Tooltip>
                                            </div>))}
                                    </div>
                                </div>))}
                        </div>
                    </div>
                </div>
            </popover_1.PopoverContent>
            <alert_dialog_1.AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <alert_dialog_1.AlertDialogContent>
                    <alert_dialog_1.AlertDialogHeader>
                        <alert_dialog_1.AlertDialogTitle>
                            Are you sure you want to delete this conversation?
                        </alert_dialog_1.AlertDialogTitle>
                        <alert_dialog_1.AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            conversation.
                        </alert_dialog_1.AlertDialogDescription>
                    </alert_dialog_1.AlertDialogHeader>
                    <alert_dialog_1.AlertDialogFooter>
                        <button_1.Button variant={'ghost'} onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </button_1.Button>
                        <button_1.Button variant={'destructive'} className="rounded-md text-sm" onClick={handleDeleteConversation}>
                            Delete
                        </button_1.Button>
                    </alert_dialog_1.AlertDialogFooter>
                </alert_dialog_1.AlertDialogContent>
            </alert_dialog_1.AlertDialog>
        </popover_1.Popover>);
});
//# sourceMappingURL=history.js.map