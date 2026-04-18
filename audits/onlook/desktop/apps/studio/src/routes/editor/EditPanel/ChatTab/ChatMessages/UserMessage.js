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
exports.UserMessage = void 0;
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const textarea_1 = require("@onlook/ui/textarea");
const tooltip_1 = require("@onlook/ui/tooltip");
const nanoid_1 = require("nanoid");
const react_1 = __importStar(require("react"));
const SentContextPill_1 = require("../ContextPills/SentContextPill");
const UserMessage = ({ message }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [isCopied, setIsCopied] = (0, react_1.useState)(false);
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [editValue, setEditValue] = (0, react_1.useState)('');
    const [isComposing, setIsComposing] = (0, react_1.useState)(false);
    const textareaRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(editValue.length, editValue.length);
        }
    }, [isEditing, editValue]);
    const handleEditClick = () => {
        setEditValue(message.getStringContent());
        setIsEditing(true);
    };
    const handleCancel = () => {
        setIsEditing(false);
        setEditValue('');
    };
    const handleSubmit = () => {
        editorEngine.chat.resubmitMessage(message.id, editValue);
        setIsEditing(false);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault();
            handleSubmit();
        }
        else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };
    function handleCopyClick() {
        const text = message.getStringContent();
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
    const handleRetry = () => {
        editorEngine.chat.resubmitMessage(message.id, message.getStringContent());
    };
    function renderEditingInput() {
        return (<div className="flex flex-col">
                <textarea_1.Textarea ref={textareaRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} className="text-small border-none resize-none px-0 mt-[-8px]" rows={2} onKeyDown={handleKeyDown} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}/>
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
    function renderContent() {
        return <div>{message.getStringContent()}</div>;
    }
    function renderButtons() {
        return (<div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-background-primary">
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button onClick={handleRetry} size="icon" variant="ghost" className="h-6 w-6 p-1">
                            <index_1.Icons.Reload className="h-4 w-4"/>
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent side="top" sideOffset={5}>
                        Retry
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>

                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button onClick={handleEditClick} size="icon" variant="ghost" className="h-6 w-6 p-1">
                            <index_1.Icons.Pencil className="h-4 w-4"/>
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent side="top" sideOffset={5}>
                        Edit
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button onClick={handleCopyClick} size="icon" variant="ghost" className="h-6 w-6 p-1">
                            {isCopied ? (<index_1.Icons.Check className="h-4 w-4 text-teal-200"/>) : (<index_1.Icons.Copy className="h-4 w-4"/>)}
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent side="top" sideOffset={5}>
                        Copy
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
            </div>);
    }
    return (<div className="relative group w-full flex flex-row justify-end px-2" key={message.id}>
            <div className="w-[90%] flex flex-col ml-8 p-2 rounded-lg shadow-sm rounded-br-none border-[0.5px] bg-background-primary relative">
                {!isEditing && renderButtons()}
                <div className="h-6 relative">
                    <div className="absolute top-1 left-0 right-0 flex flex-row justify-start items-center w-full overflow-auto pr-16">
                        <div className="flex flex-row gap-3 text-micro text-foreground-secondary">
                            {message.context.map((context) => (<SentContextPill_1.SentContextPill key={(0, nanoid_1.nanoid)()} context={context}/>))}
                        </div>
                    </div>
                </div>
                <div className="text-small mt-1">
                    {isEditing ? renderEditingInput() : renderContent()}
                </div>
            </div>
        </div>);
};
exports.UserMessage = UserMessage;
//# sourceMappingURL=UserMessage.js.map