"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInput = void 0;
const react_1 = require("react");
const mobx_react_lite_1 = require("mobx-react-lite");
const next_intl_1 = require("next-intl");
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const models_1 = require("@onlook/models");
const chat_1 = require("@onlook/models/chat");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const textarea_1 = require("@onlook/ui/textarea");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const editor_1 = require("@/components/store/editor");
const chat_2 = require("@/components/store/editor/chat");
const keys_1 = require("@/i18n/keys");
const helpers_1 = require("../context-pills/helpers");
const input_context_pills_1 = require("../context-pills/input-context-pills");
const action_buttons_1 = require("./action-buttons");
const chat_context_1 = require("./chat-context");
const chat_mode_toggle_1 = require("./chat-mode-toggle");
const queue_items_1 = require("./queue-items");
const imageDragDataSchema = zod_1.z.object({
    type: zod_1.z.literal('image'),
    originPath: zod_1.z.string(),
    fileName: zod_1.z.string(),
    mimeType: zod_1.z.string(),
});
exports.ChatInput = (0, mobx_react_lite_1.observer)(({ messages, isStreaming, onStop, onSendMessage, queuedMessages, removeFromQueue, }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const t = (0, next_intl_1.useTranslations)();
    const textareaRef = (0, react_1.useRef)(null);
    const [isComposing, setIsComposing] = (0, react_1.useState)(false);
    const [actionTooltipOpen, setActionTooltipOpen] = (0, react_1.useState)(false);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const chatMode = editorEngine.state.chatMode;
    const [inputValue, setInputValue] = (0, react_1.useState)('');
    const lastUsageMessage = (0, react_1.useMemo)(() => messages.findLast((msg) => msg.metadata?.usage), [messages]);
    const focusInput = () => {
        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };
    (0, react_1.useEffect)(() => {
        if (textareaRef.current && !isStreaming) {
            focusInput();
        }
    }, [isStreaming, messages]);
    (0, react_1.useEffect)(() => {
        const focusHandler = () => {
            if (textareaRef.current && !isStreaming) {
                focusInput();
            }
        };
        window.addEventListener(chat_2.FOCUS_CHAT_INPUT_EVENT, focusHandler);
        return () => window.removeEventListener(chat_2.FOCUS_CHAT_INPUT_EVENT, focusHandler);
    }, []);
    (0, react_1.useEffect)(() => {
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
            const handled = suggestionRef.current?.handleTabNavigation(e.shiftKey);
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
                void sendMessage();
            }
        }
    };
    async function sendMessage() {
        if (inputEmpty) {
            console.warn('Empty message');
            return;
        }
        const savedInput = inputValue.trim();
        try {
            await onSendMessage(savedInput, chatMode);
            setInputValue('');
        }
        catch (error) {
            console.error('Error sending message', error);
            sonner_1.toast.error('Failed to send message. Please try again.');
            setInputValue(savedInput);
        }
    }
    const getPlaceholderText = () => {
        if (chatMode === models_1.ChatType.ASK) {
            return 'Ask a question about your project...';
        }
        return t(keys_1.transKeys.editor.panels.edit.tabs.chat.input.placeholder);
    };
    const extractImageFiles = (items) => {
        return Array.from(items)
            .filter((item) => item.type.startsWith('image/'))
            .map((item) => item.getAsFile())
            .filter((file) => file !== null);
    };
    const handlePaste = (e) => {
        const imageFiles = extractImageFiles(e.clipboardData.items);
        if (imageFiles.length > 0) {
            e.preventDefault();
            void handleImageEvents(imageFiles, 'Pasted image');
        }
    };
    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        e.currentTarget.removeAttribute('data-dragging-image');
        // First, check for internal drag-and-drop from image panel
        const jsonData = e.dataTransfer.getData('application/json');
        if (jsonData) {
            try {
                const parsedData = JSON.parse(jsonData);
                const result = imageDragDataSchema.safeParse(parsedData);
                if (result.success) {
                    const data = result.data;
                    const currentImages = editorEngine.chat.context.context.filter((c) => c.type === chat_1.MessageContextType.IMAGE);
                    const { success, errorMessage } = (0, helpers_1.validateImageLimit)(currentImages, 1);
                    if (!success) {
                        sonner_1.toast.error(errorMessage);
                        return;
                    }
                    // Load the actual image file content
                    const branchData = editorEngine.branches.getBranchDataById(editorEngine.branches.activeBranch.id);
                    if (!branchData) {
                        sonner_1.toast.error('Failed to get branch data');
                        return;
                    }
                    const fileContent = await branchData.codeEditor.readFile(data.originPath);
                    if (!fileContent) {
                        sonner_1.toast.error('Failed to load image file');
                        return;
                    }
                    // Convert to base64 data URL
                    const base64Content = (0, utility_1.convertToBase64DataUrl)(fileContent, data.mimeType);
                    const imageContext = {
                        type: chat_1.MessageContextType.IMAGE,
                        source: 'local',
                        path: data.originPath,
                        branchId: editorEngine.branches.activeBranch.id,
                        content: base64Content,
                        displayName: data.fileName,
                        mimeType: data.mimeType,
                    };
                    editorEngine.chat.context.addContexts([imageContext]);
                    sonner_1.toast.success('Image added to chat');
                    return;
                }
            }
            catch (error) {
                console.error('Failed to parse drag data:', error);
            }
        }
        // Fall back to handling external file drops
        const imageFiles = extractImageFiles(e.dataTransfer.items);
        if (imageFiles.length > 0) {
            void handleImageEvents(imageFiles);
        }
    };
    const processImageFile = async (file) => {
        const compressedImage = await (0, utility_1.compressImageInBrowser)(file);
        if (compressedImage) {
            return compressedImage;
        }
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };
    const handleImageEvents = async (files, customDisplayName) => {
        const currentImages = editorEngine.chat.context.context.filter((c) => c.type === chat_1.MessageContextType.IMAGE);
        const { success, errorMessage } = (0, helpers_1.validateImageLimit)(currentImages, files.length);
        if (!success) {
            sonner_1.toast.error(errorMessage);
            return;
        }
        const imageContexts = [];
        for (const file of files) {
            try {
                const base64URL = await processImageFile(file);
                const contextImage = {
                    id: (0, uuid_1.v4)(),
                    type: chat_1.MessageContextType.IMAGE,
                    source: 'external',
                    content: base64URL,
                    mimeType: file.type,
                    displayName: customDisplayName && files.length === 1 ? customDisplayName : file.name,
                };
                imageContexts.push(contextImage);
            }
            catch (error) {
                console.error(`Failed to process image ${file.name}:`, error);
                sonner_1.toast.error(`Failed to process image: ${file.name}`);
            }
        }
        if (imageContexts.length > 0) {
            editorEngine.chat.context.addContexts(imageContexts);
            if (imageContexts.length > 1) {
                sonner_1.toast.success(`Added ${imageContexts.length} images to chat`);
            }
        }
    };
    const handleImageEvent = async (file, displayName) => {
        await handleImageEvents([file], displayName);
    };
    const handleScreenshot = async () => {
        try {
            const currentImages = editorEngine.chat.context.context.filter((c) => c.type === chat_1.MessageContextType.IMAGE);
            const { success, errorMessage } = (0, helpers_1.validateImageLimit)(currentImages, 1);
            if (!success) {
                throw new Error(errorMessage);
            }
            const framesWithViews = editorEngine.frames.getAll().filter((f) => !!f.view);
            if (framesWithViews.length === 0) {
                throw new Error('No active frame available for screenshot');
            }
            let screenshotData = null;
            let mimeType = 'image/jpeg';
            for (const frame of framesWithViews) {
                try {
                    if (!frame.view?.captureScreenshot) {
                        continue;
                    }
                    const result = await frame.view.captureScreenshot();
                    if (result?.data) {
                        screenshotData = result.data;
                        mimeType = result.mimeType || 'image/jpeg';
                        break;
                    }
                }
                catch (frameError) {
                    // Continue to next frame on error
                }
            }
            if (!screenshotData) {
                throw new Error('No screenshot data');
            }
            const contextImage = {
                id: (0, uuid_1.v4)(),
                type: chat_1.MessageContextType.IMAGE,
                source: 'external',
                content: screenshotData,
                mimeType: mimeType,
                displayName: 'Screenshot',
            };
            editorEngine.chat.context.addContexts([contextImage]);
            sonner_1.toast.success('Screenshot added to chat');
        }
        catch (error) {
            sonner_1.toast.error('Failed to capture screenshot. Error: ' + error);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const handleDragStateChange = (isDragging, e) => {
        const hasImage = e.dataTransfer.types.length > 0 &&
            Array.from(e.dataTransfer.items).some((item) => item.type.startsWith('image/') ||
                item.type === 'application/json' || // Internal drag from image panel
                (item.type === 'Files' && e.dataTransfer.types.includes('public.file-url')));
        if (hasImage) {
            setIsDragging(isDragging);
            e.currentTarget.setAttribute('data-dragging-image', isDragging.toString());
        }
    };
    const suggestionRef = (0, react_1.useRef)(null);
    const handleChatModeChange = (mode) => {
        editorEngine.state.chatMode = mode;
    };
    return (<div className={(0, utils_1.cn)('text-foreground-tertiary text-small flex w-full flex-col border-t transition-colors duration-200 [&[data-dragging-image=true]]:bg-teal-500/40', isDragging && 'cursor-copy')} onDrop={(e) => {
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
                <div className="flex w-full flex-col p-2">
                    <queue_items_1.QueueItems queuedMessages={queuedMessages} removeFromQueue={removeFromQueue}/>
                    <input_context_pills_1.InputContextPills />
                    <textarea_1.Textarea ref={textareaRef} placeholder={getPlaceholderText()} className={(0, utils_1.cn)('text-small mt-1 max-h-32 resize-none overflow-auto rounded-none border-0 bg-transparent p-2 caret-[#FA003C] shadow-none focus-visible:ring-0 dark:bg-transparent', 'text-foreground-primary placeholder:text-foreground-primary/50 cursor-text selection:bg-[#FA003C]/30 selection:text-[#FA003C]')} rows={3} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onInput={handleInput} onKeyDown={handleKeyDown} onPaste={handlePaste} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={(e) => {
            setIsComposing(false);
        }}/>
                </div>
                <div className="flex w-full flex-row justify-between px-2 pt-2 pb-2">
                    <div className="flex flex-row items-center gap-1.5">
                        <chat_mode_toggle_1.ChatModeToggle chatMode={chatMode} onChatModeChange={handleChatModeChange}/>
                        {lastUsageMessage?.metadata?.usage && (<chat_context_1.ChatContextWindow usage={lastUsageMessage?.metadata?.usage}/>)}
                    </div>
                    <div className="flex flex-row items-center gap-1.5">
                        <action_buttons_1.ActionButtons handleImageEvent={handleImageEvent} handleScreenshot={handleScreenshot}/>
                        {isStreaming && inputEmpty ? (<tooltip_1.Tooltip open={actionTooltipOpen} onOpenChange={setActionTooltipOpen}>
                                <tooltip_1.TooltipTrigger asChild>
                                    <button_1.Button size={'icon'} variant={'secondary'} className="text-smallPlus text-primary bg-background-primary h-full w-fit rounded-full px-2.5 py-0.5" onClick={() => {
                setActionTooltipOpen(false);
                void onStop();
            }}>
                                        <icons_1.Icons.Stop />
                                    </button_1.Button>
                                </tooltip_1.TooltipTrigger>
                                <tooltip_1.TooltipContent side="top" sideOffset={6} hideArrow>
                                    {'Stop response'}
                                </tooltip_1.TooltipContent>
                            </tooltip_1.Tooltip>) : (<button_1.Button size={'icon'} variant={'secondary'} className={(0, utils_1.cn)('text-smallPlus h-full w-fit rounded-full px-2.5 py-0.5', inputEmpty
                ? 'text-primary'
                : chatMode === models_1.ChatType.ASK
                    ? 'text-background bg-blue-300 hover:bg-blue-600'
                    : 'bg-foreground-primary text-background hover:bg-foreground-primary/80')} disabled={inputEmpty} onClick={() => void sendMessage()}>
                                <icons_1.Icons.ArrowRight />
                            </button_1.Button>)}
                    </div>
                </div>
            </div>);
});
//# sourceMappingURL=index.js.map