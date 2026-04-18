"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInput = void 0;
const Context_1 = require("@/components/Context");
const chat_1 = require("@/lib/editor/engine/chat");
const models_1 = require("@/lib/models");
const utils_1 = require("@/lib/utils");
const chat_2 = require("@onlook/models/chat");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const textarea_1 = require("@onlook/ui/textarea");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_2 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const DraftContextPill_1 = require("./ContextPills/DraftContextPill");
const DraftingImagePill_1 = require("./ContextPills/DraftingImagePill");
const Suggestions_1 = __importDefault(require("./Suggestions"));
exports.ChatInput = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const { t } = (0, react_i18next_1.useTranslation)();
    const textareaRef = (0, react_2.useRef)(null);
    const [inputValue, setInputValue] = (0, react_2.useState)('');
    const [isComposing, setIsComposing] = (0, react_2.useState)(false);
    const [actionTooltipOpen, setActionTooltipOpen] = (0, react_2.useState)(false);
    const [isDragging, setIsDragging] = (0, react_2.useState)(false);
    const focusInput = () => {
        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };
    (0, react_2.useEffect)(() => {
        if (textareaRef.current && !editorEngine.chat.isWaiting) {
            focusInput();
        }
    }, [editorEngine.chat.conversation.current?.messages.length]);
    (0, react_2.useEffect)(() => {
        if (editorEngine.editPanelTab === models_1.EditorTabValue.CHAT) {
            focusInput();
        }
    }, [editorEngine.editPanelTab]);
    (0, react_2.useEffect)(() => {
        const focusHandler = () => {
            if (textareaRef.current && !editorEngine.chat.isWaiting) {
                focusInput();
            }
        };
        window.addEventListener(chat_1.FOCUS_CHAT_INPUT_EVENT, focusHandler);
        return () => window.removeEventListener(chat_1.FOCUS_CHAT_INPUT_EVENT, focusHandler);
    }, []);
    (0, react_2.useEffect)(() => {
        const handleGlobalKeyDown = (e) => {
            if (e.key === 'Enter' && suggestionRef.current?.handleEnterSelection()) {
                e.preventDefault();
                e.stopPropagation();
                // Stop the event from bubbling to the canvas
                e.stopImmediatePropagation();
                // Handle the suggestion selection
                suggestionRef.current.handleEnterSelection();
            }
        };
        // Capture phase to intercept before it reaches the canvas
        window.addEventListener('keydown', handleGlobalKeyDown, true);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
    }, []);
    const disabled = editorEngine.chat.isWaiting || editorEngine.chat.context.context.length === 0;
    const inputEmpty = !inputValue || inputValue.trim().length === 0;
    function handleInput(e) {
        if (isComposing) {
            return;
        }
        e.currentTarget.style.height = 'auto';
        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
    }
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            // Always prevent default tab behavior
            e.preventDefault();
            e.stopPropagation();
            // Only let natural tab order continue if handleTabNavigation returns false
            const handled = suggestionRef.current?.handleTabNavigation();
            if (!handled) {
                // Focus the textarea
                textareaRef.current?.focus();
            }
        }
        else if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault();
            e.stopPropagation();
            if (suggestionRef.current?.handleEnterSelection()) {
                setTimeout(() => textareaRef.current?.focus(), 0);
                return;
            }
            if (!inputEmpty) {
                sendMessage();
            }
        }
    };
    function sendMessage() {
        if (inputEmpty) {
            console.warn('Empty message');
            return;
        }
        if (editorEngine.chat.isWaiting) {
            console.warn('Already waiting for response');
            return;
        }
        editorEngine.chat.sendNewMessage(inputValue);
        setInputValue('');
    }
    const handleRemoveContext = (contextToRemove) => {
        const newContext = [...editorEngine.chat.context.context].filter((context) => context !== contextToRemove);
        editorEngine.chat.context.context = newContext;
    };
    const handleOpenFileDialog = (e) => {
        e.currentTarget.blur(); // Removes focus from the button to prevent tooltip from showing
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.accept = 'image/*';
        inputElement.onchange = () => {
            if (inputElement.files && inputElement.files.length > 0) {
                const file = inputElement.files[0];
                const fileName = file.name;
                handleImageEvent(file, fileName);
            }
        };
        inputElement.click();
    };
    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) {
                    continue;
                }
                handleImageEvent(file, 'Pasted image');
                break;
            }
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.removeAttribute('data-dragging-image');
        const items = e.dataTransfer.items;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (!file) {
                    continue;
                }
                handleImageEvent(file, 'Dropped image');
                break;
            }
        }
    };
    const handleImageEvent = async (file, displayName) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const compressedImage = await (0, utils_1.compressImage)(file);
            const base64URL = compressedImage || event.target?.result;
            const contextImage = {
                type: chat_2.MessageContextType.IMAGE,
                content: base64URL,
                mimeType: file.type,
                displayName: displayName || file.name,
            };
            editorEngine.chat.context.context.push(contextImage);
        };
        reader.readAsDataURL(file);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const handleDragStateChange = (isDragging, e) => {
        const hasImage = e.dataTransfer.types.length > 0 &&
            Array.from(e.dataTransfer.items).some((item) => item.type.startsWith('image/') ||
                (item.type === 'Files' && e.dataTransfer.types.includes('public.file-url')));
        if (hasImage) {
            setIsDragging(isDragging);
            e.currentTarget.setAttribute('data-dragging-image', isDragging.toString());
        }
    };
    const suggestionRef = (0, react_2.useRef)(null);
    return (<div className={(0, utils_2.cn)('flex flex-col w-full text-foreground-tertiary border-t text-small transition-colors duration-200', '[&[data-dragging-image=true]]:bg-teal-500/40', isDragging && 'cursor-copy')} onDrop={(e) => {
            handleDrop(e);
            setIsDragging(false);
        }} onDragOver={handleDragOver} onDragEnter={(e) => {
            e.preventDefault();
            handleDragStateChange(true, e);
        }} onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
                handleDragStateChange(false, e);
            }
        }}>
            <Suggestions_1.default ref={suggestionRef} disabled={disabled} inputValue={inputValue} setInput={(suggestion) => {
            setInputValue(suggestion);
            textareaRef.current?.focus();
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
                }
            }, 100);
        }} onSuggestionFocus={(isFocused) => {
            if (!isFocused) {
                textareaRef.current?.focus();
            }
        }}/>

            <div className="flex flex-col w-full p-4">
                <div className={(0, utils_2.cn)('flex flex-row flex-wrap w-full gap-1.5 text-micro mb-1 text-foreground-secondary', editorEngine.chat.context.context.length > 0 ? 'min-h-6' : 'h-0')}>
                    <react_1.AnimatePresence mode="popLayout">
                        {editorEngine.chat.context.context.map((context, index) => {
            if (context.type === chat_2.MessageContextType.IMAGE) {
                return (<DraftingImagePill_1.DraftImagePill key={`image-${context.content}`} context={context} onRemove={() => handleRemoveContext(context)}/>);
            }
            return (<DraftContextPill_1.DraftContextPill key={`${context.type}-${context.content}`} context={context} onRemove={() => handleRemoveContext(context)}/>);
        })}
                    </react_1.AnimatePresence>
                </div>
                <textarea_1.Textarea ref={textareaRef} disabled={disabled} placeholder={disabled
            ? t('editor.panels.edit.tabs.chat.emptyState')
            : t('editor.panels.edit.tabs.chat.input.placeholder')} className={(0, utils_2.cn)('mt-2 overflow-auto max-h-32 text-small p-0 border-0 shadow-none rounded-none caret-[#FA003C]', 'selection:bg-[#FA003C]/30 selection:text-[#FA003C] text-foreground-primary', 'placeholder:text-foreground-primary/50', 'cursor-text', isDragging ? 'pointer-events-none' : 'pointer-events-auto')} rows={3} style={{ resize: 'none' }} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onInput={handleInput} onKeyDown={handleKeyDown} onPaste={handlePaste} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={(e) => {
            setIsComposing(false);
        }} onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.parentElement?.dispatchEvent(new DragEvent('dragenter', {
                bubbles: true,
                cancelable: true,
                dataTransfer: e.dataTransfer,
            }));
        }} onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.parentElement?.dispatchEvent(new DragEvent('dragover', {
                bubbles: true,
                cancelable: true,
                dataTransfer: e.dataTransfer,
            }));
        }} onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!e.currentTarget.contains(e.relatedTarget)) {
                e.currentTarget.parentElement?.dispatchEvent(new DragEvent('dragleave', {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: e.dataTransfer,
                }));
            }
        }} onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.parentElement?.dispatchEvent(new DragEvent('drop', {
                bubbles: true,
                cancelable: true,
                dataTransfer: e.dataTransfer,
            }));
        }}/>
            </div>
            <div className="flex flex-row w-full justify-between pt-2 pb-2 px-2">
                <div className="flex flex-row justify-start gap-1.5">
                    <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                            <button_1.Button variant={'ghost'} size={'icon'} className="w-9 h-9 text-foreground-tertiary group hover:bg-transparent" onClick={handleOpenFileDialog} disabled={disabled}>
                                <icons_1.Icons.Image className={(0, utils_2.cn)('w-5 h-5', disabled
            ? 'text-foreground-tertiary'
            : 'group-hover:text-foreground')}/>
                            </button_1.Button>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipPortal>
                            <tooltip_1.TooltipContent side="top" sideOffset={5}>
                                {disabled ? 'Select an element to start' : 'Upload Image Reference'}
                            </tooltip_1.TooltipContent>
                        </tooltip_1.TooltipPortal>
                    </tooltip_1.Tooltip>
                    <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                            <button_1.Button variant={'ghost'} size={'icon'} className="w-9 h-9 text-foreground-tertiary group hover:bg-transparent" onClick={() => {
            editorEngine.chat.context.addScreenshotContext();
        }} disabled={disabled}>
                                <icons_1.Icons.Laptop className={(0, utils_2.cn)('w-5 h-5', disabled
            ? 'text-foreground-tertiary'
            : 'group-hover:text-foreground')}/>
                            </button_1.Button>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipPortal>
                            <tooltip_1.TooltipContent side="top" sideOffset={5}>
                                {disabled
            ? 'Select an element to start'
            : 'Add screenshot of the current page'}
                            </tooltip_1.TooltipContent>
                        </tooltip_1.TooltipPortal>
                    </tooltip_1.Tooltip>
                    <button_1.Button variant={'outline'} className="w-fit h-fit py-0.5 px-2.5 text-foreground-tertiary hidden">
                        <icons_1.Icons.FilePlus className="mr-2"/>
                        <span className="text-smallPlus">File Reference</span>
                    </button_1.Button>
                </div>
                {editorEngine.chat.isWaiting ? (<tooltip_1.Tooltip open={actionTooltipOpen} onOpenChange={setActionTooltipOpen}>
                        <tooltip_1.TooltipTrigger asChild>
                            <button_1.Button size={'icon'} variant={'secondary'} className="text-smallPlus w-fit h-full py-0.5 px-2.5 text-primary" onClick={() => {
                setActionTooltipOpen(false);
                editorEngine.chat.stopStream();
            }}>
                                <icons_1.Icons.Stop />
                            </button_1.Button>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent>{'Stop response'}</tooltip_1.TooltipContent>
                    </tooltip_1.Tooltip>) : (<button_1.Button size={'icon'} variant={'secondary'} className="text-smallPlus w-fit h-full py-0.5 px-2.5 text-primary" disabled={inputEmpty || editorEngine.chat.isWaiting} onClick={sendMessage}>
                        <icons_1.Icons.ArrowRight />
                    </button_1.Button>)}
            </div>
        </div>);
});
//# sourceMappingURL=ChatInput.js.map