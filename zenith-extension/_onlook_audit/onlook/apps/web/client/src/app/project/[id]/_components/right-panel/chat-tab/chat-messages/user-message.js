"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMessage = exports.getUserMessageContent = void 0;
const react_1 = __importStar(require("react"));
const nanoid_1 = require("nanoid");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const textarea_1 = require("@onlook/ui/textarea");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const editor_1 = require("@/components/store/editor");
const git_1 = require("@/components/store/editor/git");
const mobx_react_lite_1 = require("mobx-react-lite");
const sent_context_pill_1 = require("../context-pills/sent-context-pill");
const message_content_1 = require("./message-content");
const multi_branch_revert_modal_1 = require("./multi-branch-revert-modal");
const getUserMessageContent = (message) => {
    return message.parts
        .map((part) => {
        if (part.type === 'text') {
            return part.text;
        }
        return '';
    })
        .join('');
};
exports.getUserMessageContent = getUserMessageContent;
const UserMessageComponent = ({ onEditMessage, message }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [isCopied, setIsCopied] = (0, react_1.useState)(false);
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [editValue, setEditValue] = (0, react_1.useState)('');
    const [isComposing, setIsComposing] = (0, react_1.useState)(false);
    const [isRestoring, setIsRestoring] = (0, react_1.useState)(false);
    const [isMultiBranchModalOpen, setIsMultiBranchModalOpen] = (0, react_1.useState)(false);
    const textareaRef = (0, react_1.useRef)(null);
    const gitCheckpoints = message.metadata?.checkpoints?.filter((s) => s.type === models_1.MessageCheckpointType.GIT) ?? [];
    // Legacy checkpoints (created before multi-branch support) don't have branchId.
    // If any exist, fall back to simple single-branch restore UI.
    const hasLegacyCheckpoints = gitCheckpoints.some((cp) => !cp.branchId);
    (0, react_1.useEffect)(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            if (editValue === (0, exports.getUserMessageContent)(message)) {
                textareaRef.current.setSelectionRange(editValue.length, editValue.length);
            }
        }
    }, [isEditing]);
    const handleEditClick = () => {
        setEditValue((0, exports.getUserMessageContent)(message));
        setIsEditing(true);
    };
    const handleCancel = () => {
        setIsEditing(false);
        setEditValue('');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault();
            void handleSubmit();
        }
        else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };
    async function handleCopyClick() {
        const text = (0, exports.getUserMessageContent)(message);
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
    const handleSubmit = async () => {
        setIsEditing(false);
        await sendMessage(editValue);
    };
    const handleRetry = async () => {
        sonner_1.toast.promise(onEditMessage(message.id, (0, exports.getUserMessageContent)(message), models_1.ChatType.EDIT), {
            error: 'Failed to resubmit message',
        });
    };
    const sendMessage = async (newContent) => {
        sonner_1.toast.promise(onEditMessage(message.id, newContent, models_1.ChatType.EDIT), {
            loading: 'Editing message...',
            success: 'Message resubmitted successfully',
            error: 'Failed to resubmit message',
        });
    };
    const handleRestoreSingleBranch = async (checkpoint) => {
        setIsRestoring(true);
        await (0, git_1.restoreCheckpoint)(checkpoint, editorEngine);
        setIsRestoring(false);
    };
    const handleRestoreLegacy = async () => {
        // Legacy checkpoints without branchId will restore to the active branch
        const firstCheckpoint = gitCheckpoints[0];
        if (firstCheckpoint) {
            setIsRestoring(true);
            await (0, git_1.restoreCheckpoint)(firstCheckpoint, editorEngine);
            setIsRestoring(false);
        }
    };
    const getBranchName = (branchId) => {
        if (!branchId) {
            return editorEngine.branches.activeBranch.name;
        }
        const branch = editorEngine.branches.getBranchById(branchId);
        return branch?.name || branchId;
    };
    function renderEditingInput() {
        return (<div className="flex flex-col">
                <textarea_1.Textarea ref={textareaRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} className="text-small mt-[-8px] resize-none border-none px-0" rows={2} onKeyDown={handleKeyDown} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}/>
                <div className="flex justify-end gap-2">
                    <button_1.Button size="sm" variant={'ghost'} onClick={handleCancel}>
                        Cancel
                    </button_1.Button>
                    <button_1.Button size="sm" variant={'outline'} onClick={handleSubmit}>
                        Submit
                    </button_1.Button>
                </div>
            </div>);
    }
    function renderButtons() {
        return (<div className="bg-background-primary absolute top-2 right-2 z-10 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button onClick={handleRetry} size="icon" variant="ghost" className="h-6 w-6 p-1">
                            <icons_1.Icons.Reload className="h-4 w-4"/>
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent side="top" sideOffset={5}>
                        Retry
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>

                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button onClick={handleEditClick} size="icon" variant="ghost" className="h-6 w-6 p-1">
                            <icons_1.Icons.Pencil className="h-4 w-4"/>
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent side="top" sideOffset={5}>
                        Edit
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button onClick={handleCopyClick} size="icon" variant="ghost" className="h-6 w-6 p-1">
                            {isCopied ? (<icons_1.Icons.Check className="h-4 w-4 text-teal-200"/>) : (<icons_1.Icons.Copy className="h-4 w-4"/>)}
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent side="top" sideOffset={5}>
                        Copy
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
            </div>);
    }
    return (<div className="group relative flex w-full flex-row justify-end px-2" key={message.id}>
            <div className="bg-background-primary relative ml-8 flex w-[90%] flex-col rounded-lg rounded-br-none border-[0.5px] p-2 shadow-sm">
                {!isEditing && renderButtons()}
                <div className="relative h-6">
                    <div className="absolute top-1 right-0 left-0 flex w-full flex-row items-center justify-start overflow-auto pr-16">
                        <div className="text-micro text-foreground-secondary flex flex-row gap-3">
                            {message.metadata?.context?.map((context) => (<sent_context_pill_1.SentContextPill key={(0, nanoid_1.nanoid)()} context={context}/>))}
                        </div>
                    </div>
                </div>
                <div className="text-small mt-1">
                    {isEditing ? (renderEditingInput()) : (<message_content_1.MessageContent messageId={message.id} parts={message.parts} applied={false} isStream={false}/>)}
                </div>
            </div>
            {gitCheckpoints.length > 0 && (<div className="absolute top-1/2 left-2 -translate-y-1/2">
                    {hasLegacyCheckpoints ? (<tooltip_1.Tooltip>
                            <tooltip_1.TooltipTrigger asChild>
                                <button onClick={handleRestoreLegacy} className={(0, utils_1.cn)('rounded-md p-2 text-xs opacity-0 group-hover:opacity-100 hover:opacity-80', isRestoring ? 'opacity-100' : 'opacity-0')} disabled={isRestoring}>
                                    {isRestoring ? (<icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>) : (<icons_1.Icons.Reset className="h-4 w-4"/>)}
                                </button>
                            </tooltip_1.TooltipTrigger>
                            <tooltip_1.TooltipContent side="top" sideOffset={5}>
                                {isRestoring ? 'Restoring...' : 'Restore to here'}
                            </tooltip_1.TooltipContent>
                        </tooltip_1.Tooltip>) : (<>
                            <tooltip_1.Tooltip>
                                <dropdown_menu_1.DropdownMenu>
                                    <tooltip_1.TooltipTrigger asChild>
                                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                                            <button className={(0, utils_1.cn)('rounded-md p-2 text-xs opacity-0 group-hover:opacity-100 hover:opacity-80', isRestoring ? 'opacity-100' : 'opacity-0')} disabled={isRestoring}>
                                                {isRestoring ? (<icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>) : (<icons_1.Icons.Reset className="h-4 w-4"/>)}
                                            </button>
                                        </dropdown_menu_1.DropdownMenuTrigger>
                                    </tooltip_1.TooltipTrigger>
                                    <tooltip_1.TooltipContent side="top" sideOffset={5}>
                                        {isRestoring ? 'Restoring...' : 'Restore to here'}
                                    </tooltip_1.TooltipContent>
                                    <dropdown_menu_1.DropdownMenuContent align="start" side="right">
                                        <dropdown_menu_1.DropdownMenuLabel>Restore Branch</dropdown_menu_1.DropdownMenuLabel>
                                        {gitCheckpoints.map((checkpoint) => (<dropdown_menu_1.DropdownMenuItem key={checkpoint.branchId} onClick={() => handleRestoreSingleBranch(checkpoint)}>
                                                {getBranchName(checkpoint.branchId)}
                                            </dropdown_menu_1.DropdownMenuItem>))}
                                        {gitCheckpoints.length > 1 && (<>
                                                <dropdown_menu_1.DropdownMenuSeparator />
                                                <dropdown_menu_1.DropdownMenuItem onClick={() => setIsMultiBranchModalOpen(true)}>
                                                    Select Multiple Branches...
                                                </dropdown_menu_1.DropdownMenuItem>
                                            </>)}
                                    </dropdown_menu_1.DropdownMenuContent>
                                </dropdown_menu_1.DropdownMenu>
                            </tooltip_1.Tooltip>
                            <multi_branch_revert_modal_1.MultiBranchRevertModal open={isMultiBranchModalOpen} onOpenChange={setIsMultiBranchModalOpen} checkpoints={gitCheckpoints}/>
                        </>)}
                </div>)}
        </div>);
};
exports.UserMessage = (0, react_1.memo)((0, mobx_react_lite_1.observer)(UserMessageComponent));
//# sourceMappingURL=user-message.js.map