"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputImage = void 0;
const editor_1 = require("@/components/store/editor");
const constants_1 = require("@onlook/constants");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const separator_1 = require("@onlook/ui/separator");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const use_background_image_update_1 = require("../hooks/use-background-image-update");
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const hover_tooltip_1 = require("../hover-tooltip");
const toolbar_button_1 = require("../toolbar-button");
exports.InputImage = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const fileInputRef = (0, react_1.useRef)(null);
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    const [uploadError, setUploadError] = (0, react_1.useState)(null);
    const previewImage = editorEngine.image.previewImage ?? editorEngine.image.selectedImage;
    const { IMAGE_FIT_OPTIONS, fillOption, currentBackgroundImage, handleFillOptionChange, removeBackground, } = (0, use_background_image_update_1.useBackgroundImage)(editorEngine);
    const currentFillOptionLabel = IMAGE_FIT_OPTIONS.find((opt) => opt.value === fillOption)?.label ?? 'Fill';
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'input-image-dropdown',
    });
    const handleSelectFromLibrary = (0, react_1.useCallback)(() => {
        editorEngine.state.leftPanelTab = models_1.LeftPanelTabValue.IMAGES;
        editorEngine.state.leftPanelLocked = true;
    }, []);
    const handleUploadFromComputer = (0, react_1.useCallback)(() => {
        fileInputRef.current?.click();
    }, []);
    const handleFileChange = (0, react_1.useCallback)(async (e) => {
        const file = e.target.files?.[0];
        if (!file?.type.startsWith('image/')) {
            setUploadError('Please select a valid image file');
            return;
        }
        setIsUploading(true);
        setUploadError(null);
        try {
            await editorEngine.image.upload(file, constants_1.DefaultSettings.IMAGE_FOLDER);
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result;
                const imageData = {
                    originPath: `${constants_1.DefaultSettings.IMAGE_FOLDER}/${file.name}`,
                    content: result,
                    fileName: file.name,
                    mimeType: file.type,
                };
                editorEngine.image.setSelectedImage(imageData);
                editorEngine.image.setPreviewImage(imageData);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
        catch (error) {
            console.error('Failed to upload image:', error);
            setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
            setIsUploading(false);
        }
        e.target.value = '';
    }, []);
    const handleFillOptionChangeInternal = (option) => {
        handleFillOptionChange(option);
    };
    const handleClose = () => {
        editorEngine.image.setIsSelectingImage(false);
        editorEngine.image.setPreviewImage(null);
        editorEngine.image.setSelectedImage(null);
        onOpenChange(false);
    };
    const handleOpenChange = (open) => {
        if (open) {
            onOpenChange(true);
        }
    };
    const loadImage = async () => {
        editorEngine.image.setIsSelectingImage(true);
        if (currentBackgroundImage) {
            const absolutePath = (0, utility_1.addImageFolderPrefix)(currentBackgroundImage);
            const content = await editorEngine.image.readImageContent(absolutePath);
            if (content) {
                editorEngine.image.setSelectedImage(content);
            }
        }
        else {
            editorEngine.image.setSelectedImage(null);
        }
    };
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            loadImage();
        }
        else {
            editorEngine.image.setIsSelectingImage(false);
        }
    }, [isOpen]);
    return (<div className="flex flex-col gap-2">
            <dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={handleOpenChange} modal={false}>
                <hover_tooltip_1.HoverOnlyTooltip content="Image Fill" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex w-9 flex-col items-center justify-center gap-0.5 relative" disabled={isUploading}>
                            {isUploading ? (<icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>) : currentBackgroundImage ? (<div className="h-6 w-6 bg-cover bg-center" style={{
                backgroundImage: currentBackgroundImage,
            }}/>) : (<icons_1.Icons.Image className="h-2 w-2"/>)}
                            {isUploading && (<div className="absolute inset-0 bg-blue-500/20 rounded animate-pulse"/>)}
                        </toolbar_button_1.ToolbarButton>
                    </dropdown_menu_1.DropdownMenuTrigger>
                </hover_tooltip_1.HoverOnlyTooltip>
                <dropdown_menu_1.DropdownMenuContent align="start" side="bottom" className="w-[280px] mt-1 rounded-lg overflow-hidden shadow-xl backdrop-blur-lg">
                    <div className="flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3">
                            <h3 className="text-sm font-medium text-foreground">Image Fill</h3>
                            <button_1.Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={handleClose} disabled={isUploading}>
                                <icons_1.Icons.CrossL className="h-4 w-4"/>
                            </button_1.Button>
                        </div>
                        <separator_1.Separator />
                        <div className="p-3 flex flex-col gap-3">
                            {/* Fill Options */}
                            <div className="flex items-center gap-4">
                                <dropdown_menu_1.DropdownMenu modal={false}>
                                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                                        <button_1.Button variant="outline" className="w-32 justify-between bg-background-tertiary/50 border-border hover:bg-background-tertiary/70" disabled={isUploading}>
                                            <>
                                                {currentFillOptionLabel}
                                                <icons_1.Icons.ChevronDown className="h-4 w-4 opacity-50"/>
                                            </>
                                        </button_1.Button>
                                    </dropdown_menu_1.DropdownMenuTrigger>
                                    <dropdown_menu_1.DropdownMenuContent align="start" className="w-32">
                                        {IMAGE_FIT_OPTIONS.map((option) => (<dropdown_menu_1.DropdownMenuItem key={option.value} onClick={() => handleFillOptionChangeInternal(option.value)} className="text-sm" disabled={isUploading}>
                                                {option.label}
                                            </dropdown_menu_1.DropdownMenuItem>))}
                                    </dropdown_menu_1.DropdownMenuContent>
                                </dropdown_menu_1.DropdownMenu>
                            </div>

                            {/* Image preview */}
                            <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg overflow-hidden relative">
                                {previewImage ? (<>
                                        <img src={previewImage.content} alt="Preview" className="w-full h-full object-cover"/>
                                        {isUploading && (<div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                                                <div className="bg-white/90 rounded-full p-2">
                                                    <icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin text-blue-600"/>
                                                </div>
                                            </div>)}
                                    </>) : (<div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                        <icons_1.Icons.Image className="w-12 h-12 text-white/50"/>
                                    </div>)}
                            </div>

                            {/* Action buttons */}
                            <button_1.Button onClick={handleSelectFromLibrary} variant="outline" className="w-full justify-start gap-2 !bg-gray-50 hover:bg-gray-200 text-black border-border hover:text-black" disabled={isUploading}>
                                <div className="flex items-center gap-2">
                                    <icons_1.Icons.Library className="w-4 h-4"/>
                                    Select from library
                                </div>
                            </button_1.Button>
                            <button_1.Button onClick={handleUploadFromComputer} variant="outline" disabled={isUploading} className="w-full justify-start gap-2 bg-gray-700 text-white border-border hover:bg-gray-50 disabled:opacity-50">
                                <div className="flex items-center gap-2">
                                    {isUploading ? (<icons_1.Icons.LoadingSpinner className="w-4 h-4 animate-spin"/>) : (<icons_1.Icons.Upload className="w-4 h-4"/>)}
                                    {isUploading ? 'Uploading...' : 'Upload from computer'}
                                </div>
                            </button_1.Button>

                            {uploadError && (<div className="text-red-500 text-xs mt-1 px-1">{uploadError}</div>)}

                            {currentBackgroundImage && (<button_1.Button onClick={removeBackground} variant="outline" className="w-full justify-start gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100" disabled={isUploading}>
                                    <div className="flex items-center gap-2">
                                        <icons_1.Icons.CrossL className="w-4 h-4"/>
                                        Remove background
                                    </div>
                                </button_1.Button>)}
                        </div>
                    </div>
                </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
        </div>);
});
//# sourceMappingURL=input-image.js.map