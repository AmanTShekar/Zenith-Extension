"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptingCard = void 0;
const Context_1 = require("@/components/Context");
const projects_1 = require("@/lib/projects");
const utils_1 = require("@/lib/utils");
const chat_1 = require("@onlook/models/chat");
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const icons_1 = require("@onlook/ui/icons");
const motion_card_1 = require("@onlook/ui/motion-card");
const textarea_1 = require("@onlook/ui/textarea");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_2 = require("@onlook/ui/utils");
const react_1 = require("motion/react");
const react_2 = require("react");
const use_resize_observer_1 = __importDefault(require("use-resize-observer"));
const DraftingImagePill_1 = require("../../editor/EditPanel/ChatTab/ContextPills/DraftingImagePill");
const react_i18next_1 = require("react-i18next");
const PromptingCard = () => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const { ref: diffRef, height: diffHeight } = (0, use_resize_observer_1.default)();
    const [inputValue, setInputValue] = (0, react_2.useState)('');
    const [isDragging, setIsDragging] = (0, react_2.useState)(false);
    const [selectedImages, setSelectedImages] = (0, react_2.useState)([]);
    const [imageTooltipOpen, setImageTooltipOpen] = (0, react_2.useState)(false);
    const [isHandlingFile, setIsHandlingFile] = (0, react_2.useState)(false);
    const textareaRef = (0, react_2.useRef)(null);
    const isInputInvalid = !inputValue || inputValue.trim().length < 10;
    const [isComposing, setIsComposing] = (0, react_2.useState)(false);
    const imageRef = (0, react_2.useRef)(null);
    const { t } = (0, react_i18next_1.useTranslation)();
    (0, react_2.useEffect)(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                projectsManager.projectsTab = projects_1.ProjectTabs.PROJECTS;
            }
        };
        window.addEventListener('keydown', handleEscapeKey);
        return () => window.removeEventListener('keydown', handleEscapeKey);
    }, []);
    const handleSubmit = async () => {
        if (isInputInvalid) {
            console.warn('Input is too short');
            return;
        }
        projectsManager.create.sendPrompt(inputValue, selectedImages, false);
    };
    const handleBlankSubmit = async () => {
        projectsManager.create.sendPrompt('', [], true);
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
            const compressedImage = await (0, utils_1.compressImage)(file);
            // If compression failed, fall back to original file
            const base64 = compressedImage ||
                (await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                }));
            return {
                type: chat_1.MessageContextType.IMAGE,
                content: base64,
                displayName: file.name,
                mimeType: file.type,
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
    return (<react_1.MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
            <div className="flex flex-col gap-4 mb-12">
                <motion_card_1.MotionCard initial={{ opacity: 0, y: 20 }} animate={{ height: diffHeight, opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={(0, utils_2.cn)('w-[600px] backdrop-blur-md bg-background/30 overflow-hidden', isDragging && 'bg-background')}>
                    <react_1.motion.div ref={diffRef} layout="position" className="flex flex-col">
                        <card_1.CardHeader>
                            <react_1.motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl text-foreground-primary">
                                {t('projects.prompt.title')}
                            </react_1.motion.h2>
                            <react_1.motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-sm text-foreground-secondary">
                                {t('projects.prompt.description')}
                            </react_1.motion.p>
                        </card_1.CardHeader>
                        <card_1.CardContent>
                            <div className={(0, utils_2.cn)('flex flex-col gap-3 rounded p-0 transition-colors duration-200 cursor-text', 'backdrop-blur-sm bg-background-secondary/80', '[&[data-dragging-image=true]]:bg-teal-500/40', isDragging && 'bg-teal-500/40 cursor-copy')} onClick={handleContainerClick} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                <div className={`flex flex-col w-full ${selectedImages.length > 0 ? 'p-4' : 'px-4 pt-1'}`}>
                                    <div className={(0, utils_2.cn)('flex flex-row flex-wrap w-full gap-1.5 text-micro text-foreground-secondary', selectedImages.length > 0 ? 'min-h-6' : 'h-0')}>
                                        <react_1.AnimatePresence mode="popLayout">
                                            {selectedImages.map((imageContext, index) => (<DraftingImagePill_1.DraftImagePill key={`image-${index}-${imageContext.content}`} context={imageContext} onRemove={() => handleRemoveImage(imageContext)}/>))}
                                        </react_1.AnimatePresence>
                                    </div>
                                    <textarea_1.Textarea ref={textareaRef} className={(0, utils_2.cn)('mt-2 overflow-auto min-h-[60px] text-small p-0 border-0 shadow-none rounded-none caret-[#FA003C]', 'selection:bg-[#FA003C]/30 selection:text-[#FA003C] text-foreground-primary', 'placeholder:text-foreground-primary/50', 'cursor-text', 'transition-[height] duration-300 ease-in-out')} placeholder={t('projects.prompt.input.placeholder')} value={inputValue} onChange={(e) => {
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
                                <div className="flex flex-row w-full justify-between pt-0 pb-2 px-2">
                                    <div className="flex flex-row justify-start gap-1.5">
                                        <tooltip_1.Tooltip open={imageTooltipOpen && !isHandlingFile} onOpenChange={(open) => !isHandlingFile && setImageTooltipOpen(open)}>
                                            <tooltip_1.TooltipTrigger asChild>
                                                <button_1.Button variant="ghost" size="icon" className="w-9 h-9 text-foreground-tertiary group hover:bg-transparent" onClick={() => document
            .getElementById('image-input')
            ?.click()}>
                                                    <input id="image-input" type="file" ref={imageRef} accept="image/*" multiple className="hidden" onChange={handleFileSelect}/>
                                                    <icons_1.Icons.Image className={(0, utils_2.cn)('w-5 h-5', 'group-hover:text-foreground')}/>
                                                </button_1.Button>
                                            </tooltip_1.TooltipTrigger>
                                            <tooltip_1.TooltipPortal>
                                                <tooltip_1.TooltipContent side="top" sideOffset={5}>
                                                    {t('projects.prompt.input.imageUpload')}
                                                </tooltip_1.TooltipContent>
                                            </tooltip_1.TooltipPortal>
                                        </tooltip_1.Tooltip>
                                        <button_1.Button variant="outline" className="w-fit h-fit py-0.5 px-2.5 text-foreground-tertiary hidden">
                                            <icons_1.Icons.FilePlus className="mr-2"/>
                                            <span className="text-smallPlus">
                                                {t('projects.prompt.input.fileReference')}
                                            </span>
                                        </button_1.Button>
                                    </div>
                                    <tooltip_1.Tooltip>
                                        <tooltip_1.TooltipTrigger asChild>
                                            <button_1.Button size="icon" variant="secondary" className={(0, utils_2.cn)('text-smallPlus w-fit h-full py-2 px-2', isInputInvalid
            ? 'text-primary'
            : 'bg-foreground-primary text-white hover:bg-foreground-hover')} disabled={isInputInvalid} onClick={handleSubmit}>
                                                <icons_1.Icons.ArrowRight className={(0, utils_2.cn)('w-5 h-5', !isInputInvalid
            ? 'text-background'
            : 'text-foreground-primary')}/>
                                            </button_1.Button>
                                        </tooltip_1.TooltipTrigger>
                                        <tooltip_1.TooltipPortal>
                                            <tooltip_1.TooltipContent>
                                                {t('projects.prompt.input.submit')}
                                            </tooltip_1.TooltipContent>
                                        </tooltip_1.TooltipPortal>
                                    </tooltip_1.Tooltip>
                                </div>
                            </div>
                        </card_1.CardContent>
                    </react_1.motion.div>
                </motion_card_1.MotionCard>
                <button_1.Button variant="outline" className="w-fit mx-auto bg-background-secondary/90 text-sm border text-foreground-secondary" onClick={handleBlankSubmit}>
                    <icons_1.Icons.File className="w-4 h-4 mr-2"/> {t('projects.prompt.blankStart')}
                </button_1.Button>
            </div>
        </react_1.MotionConfig>);
};
exports.PromptingCard = PromptingCard;
//# sourceMappingURL=PromptingCard.js.map