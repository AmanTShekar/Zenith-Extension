"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Create = void 0;
const auth_context_1 = require("@/app/auth/auth-context");
const image_pill_1 = require("@/app/project/[id]/_components/right-panel/chat-tab/context-pills/image-pill");
const helpers_1 = require("@/app/project/[id]/_components/right-panel/chat-tab/context-pills/helpers");
const create_1 = require("@/components/store/create");
const constants_1 = require("@/utils/constants");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const textarea_1 = require("@onlook/ui/textarea");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const localforage_1 = __importDefault(require("localforage"));
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const navigation_1 = require("next/navigation");
const react_2 = require("react");
const uuid_1 = require("uuid");
const SAVED_INPUT_KEY = 'create-input';
exports.Create = (0, mobx_react_lite_1.observer)(({ cardKey, isCreatingProject, setIsCreatingProject, user, }) => {
    const createManager = (0, create_1.useCreateManager)();
    const router = (0, navigation_1.useRouter)();
    const imageRef = (0, react_2.useRef)(null);
    const { setIsAuthModalOpen } = (0, auth_context_1.useAuthContext)();
    const textareaRef = (0, react_2.useRef)(null);
    const [inputValue, setInputValue] = (0, react_2.useState)('');
    const [isDragging, setIsDragging] = (0, react_2.useState)(false);
    const [selectedImages, setSelectedImages] = (0, react_2.useState)([]);
    const [imageTooltipOpen, setImageTooltipOpen] = (0, react_2.useState)(false);
    const [isHandlingFile, setIsHandlingFile] = (0, react_2.useState)(false);
    const isInputInvalid = !inputValue || inputValue.trim().length < 10;
    const [isComposing, setIsComposing] = (0, react_2.useState)(false);
    // Restore draft from localStorage if exists
    (0, react_2.useEffect)(() => {
        const getDraft = async () => {
            const draft = await localforage_1.default.getItem(SAVED_INPUT_KEY);
            if (draft) {
                try {
                    const { prompt, images } = draft;
                    // Only restore if draft is less than 1 hour old
                    setInputValue(prompt);
                    setSelectedImages(images);
                    // Clear the draft after restoring
                    await localforage_1.default.removeItem(SAVED_INPUT_KEY);
                }
                catch (error) {
                    console.error('Error restoring draft:', error);
                }
            }
        };
        getDraft();
    }, []);
    const handleSubmit = async () => {
        if (isInputInvalid) {
            console.warn('Input is too short');
            return;
        }
        createProject(inputValue, selectedImages);
    };
    const createProject = async (prompt, images) => {
        if (!user?.id) {
            console.error('No user ID found');
            const createInputContext = {
                prompt,
                images,
                timestamp: Date.now()
            };
            localforage_1.default.setItem(SAVED_INPUT_KEY, createInputContext);
            // Open the auth modal
            setIsAuthModalOpen(true);
            return;
        }
        setIsCreatingProject(true);
        try {
            const project = await createManager.startCreate(user?.id, prompt, images);
            if (!project) {
                throw new Error('Failed to create project: No project returned');
            }
            router.push(`${constants_1.Routes.PROJECT}/${project.id}`);
            await localforage_1.default.removeItem(SAVED_INPUT_KEY);
        }
        catch (error) {
            console.error('Error creating project:', error);
            sonner_1.toast.error('Failed to create project', {
                description: error instanceof Error ? error.message : String(error),
            });
        }
        finally {
            setIsCreatingProject(false);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        setImageTooltipOpen(false);
        // Find and reset the container's data attribute
        const container = e.currentTarget.closest('.bg-background-secondary');
        if (container) {
            container.setAttribute('data-dragging-image', 'false');
        }
        const files = Array.from(e.dataTransfer.files);
        handleNewImageFiles(files);
    };
    const handleFileSelect = async (e) => {
        setIsHandlingFile(true);
        setImageTooltipOpen(false);
        const files = Array.from(e.target.files || []);
        handleNewImageFiles(files);
    };
    const handleNewImageFiles = async (files) => {
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        const { success, errorMessage } = (0, helpers_1.validateImageLimit)(selectedImages, imageFiles.length);
        if (!success) {
            sonner_1.toast.error(errorMessage);
            setIsHandlingFile(false);
            return;
        }
        const imageContexts = [];
        if (imageFiles.length > 0) {
            // Handle the dropped image files
            for (const file of imageFiles) {
                const imageContext = await createImageMessageContext(file);
                if (imageContext) {
                    imageContexts.push(imageContext);
                }
            }
        }
        setSelectedImages([...selectedImages, ...imageContexts]);
        setIsHandlingFile(false);
    };
    const handleRemoveImage = (imageContext) => {
        if (imageRef && imageRef.current) {
            imageRef.current.value = '';
        }
        setSelectedImages(selectedImages.filter((f) => f !== imageContext));
    };
    const createImageMessageContext = async (file) => {
        try {
            const compressedImage = await (0, utility_1.compressImageInBrowser)(file);
            // If compression failed, fall back to original file
            const base64 = compressedImage ||
                (await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                            resolve(reader.result);
                        }
                        else {
                            reject(new Error('Failed to read file'));
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                }));
            return {
                type: models_1.MessageContextType.IMAGE,
                source: 'external',
                content: base64,
                displayName: file.name,
                mimeType: file.type,
                id: (0, uuid_1.v4)(),
            };
        }
        catch (error) {
            console.error('Error reading file:', error);
            return null;
        }
    };
    const handleDragStateChange = (isDragging, e) => {
        const hasImage = e.dataTransfer.types.length > 0 &&
            Array.from(e.dataTransfer.items).some((item) => item.type.startsWith('image/') ||
                (item.type === 'Files' && e.dataTransfer.types.includes('public.file-url')));
        if (hasImage) {
            setIsDragging(isDragging);
            // Find the container div with the bg-background-secondary class
            const container = e.currentTarget.closest('.bg-background-secondary');
            if (container) {
                container.setAttribute('data-dragging-image', isDragging.toString());
            }
        }
    };
    const handleContainerClick = (e) => {
        // Don't focus if clicking on a button, pill, or the textarea itself
        if (e.target instanceof Element &&
            (e.target.closest('button') ||
                e.target.closest('.group') || // Pills have 'group' class
                e.target === textareaRef.current)) {
            return;
        }
        textareaRef.current?.focus();
    };
    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            // Reset height to auto to get the correct scrollHeight
            textareaRef.current.style.height = 'auto';
            const lineHeight = 20; // Approximate line height in pixels
            const maxHeight = lineHeight * 10; // 10 lines maximum
            const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    };
    return (<card_1.Card key={cardKey} className={(0, utils_1.cn)('w-[600px] overflow-hidden gap-1.5 backdrop-blur-md bg-background/20 p-4', isDragging && 'bg-background/40')}>
            <card_1.CardHeader className="text-start p-0 text-foreground-primary/80">{`Let's design a...`}</card_1.CardHeader>
            <card_1.CardContent className="p-0">
                <div className={(0, utils_1.cn)('flex flex-col gap-3 rounded p-0 transition-colors duration-200 cursor-text', 'backdrop-blur-sm bg-background-secondary/80', '[&[data-dragging-image=true]]:bg-teal-500/40', isDragging && 'bg-teal-500/40 cursor-copy')} onClick={handleContainerClick} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                    <div className={`flex flex-col w-full ${selectedImages.length > 0 ? 'p-4' : 'px-2 pt-1'}`}>
                        <div className={(0, utils_1.cn)('flex flex-row flex-wrap w-full gap-1.5 text-micro text-foreground-secondary', selectedImages.length > 0 ? 'min-h-6' : 'h-0')}>
                            <react_1.AnimatePresence mode="popLayout">
                                {selectedImages.map((imageContext) => (<image_pill_1.ImagePill key={imageContext.content} context={imageContext} onRemove={() => handleRemoveImage(imageContext)}/>))}
                            </react_1.AnimatePresence>
                        </div>
                        <div className="relative flex items-center w-full mt-1">
                            <textarea_1.Textarea ref={textareaRef} className={(0, utils_1.cn)('overflow-auto min-h-[60px] text-small border-0 shadow-none rounded-none caret-[#FA003C]', 'selection:bg-[#FA003C]/30 selection:text-[#FA003C] text-foreground-primary', 'cursor-text placeholder:text-foreground-primary/50', 'transition-[height] duration-300 ease-in-out bg-transparent dark:bg-transparent focus-visible:ring-0 ')} placeholder="Paste a link, imagery, or more as inspiration" value={inputValue} onChange={(e) => {
            setInputValue(e.target.value);
            adjustTextareaHeight();
        }} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={(e) => {
            setIsComposing(false);
        }} onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                e.preventDefault();
                handleSubmit();
            }
        }} onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDragStateChange(true, e);
        }} onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDragStateChange(true, e);
        }} onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!e.currentTarget.contains(e.relatedTarget)) {
                handleDragStateChange(false, e);
            }
        }} onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDragStateChange(false, e);
            handleDrop(e);
        }} rows={3} style={{ resize: 'none' }}/>
                        </div>
                        <div className="flex flex-row w-full justify-between items-center pt-2 pb-2 px-0">
                            <div className="flex flex-row justify-start gap-1.5">
                                <tooltip_1.Tooltip open={imageTooltipOpen && !isHandlingFile} onOpenChange={(open) => !isHandlingFile && setImageTooltipOpen(open)}>
                                    <tooltip_1.TooltipTrigger asChild>
                                        <button_1.Button variant="ghost" size="icon" className="w-9 h-9 text-foreground-tertiary group hover:bg-transparent cursor-pointer" onClick={() => document.getElementById('image-input')?.click()}>
                                            <input id="image-input" type="file" ref={imageRef} accept="image/*" multiple className="hidden" onChange={handleFileSelect}/>
                                            <icons_1.Icons.Image className={(0, utils_1.cn)('w-5 h-5', 'group-hover:text-foreground')}/>
                                        </button_1.Button>
                                    </tooltip_1.TooltipTrigger>
                                    <tooltip_1.TooltipPortal>
                                        <tooltip_1.TooltipContent side="top" sideOffset={5}>
                                            Upload image
                                        </tooltip_1.TooltipContent>
                                    </tooltip_1.TooltipPortal>
                                </tooltip_1.Tooltip>
                            </div>
                            <button_1.Button size="icon" variant="secondary" className={(0, utils_1.cn)('text-smallPlus w-9 h-9 cursor-pointer', isInputInvalid
            ? 'text-foreground-primary'
            : 'bg-foreground-primary text-white hover:bg-foreground-hover')} disabled={isInputInvalid || isCreatingProject} onClick={handleSubmit}>
                                {isCreatingProject ? (<icons_1.Icons.LoadingSpinner className="w-5 h-5 animate-pulse text-background"/>) : (<icons_1.Icons.ArrowRight className={(0, utils_1.cn)('w-5 h-5', !isInputInvalid
                ? 'text-background'
                : 'text-foreground-primary')}/>)}
                            </button_1.Button>
                        </div>
                    </div>
                </div>
            </card_1.CardContent>
        </card_1.Card>);
});
//# sourceMappingURL=create.js.map