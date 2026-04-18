"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_2 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const DeleteModal_1 = __importDefault(require("./DeleteModal"));
const RenameModal_1 = __importDefault(require("./RenameModal"));
const ImagesTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const [activeDropdown, setActiveDropdown] = (0, react_1.useState)(null);
    const [search, setSearch] = (0, react_1.useState)('');
    const [uploadError, setUploadError] = (0, react_1.useState)(null);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const imageFolder = projectsManager.project?.folderPath
        ? `${projectsManager.project.folderPath}${utils_1.platformSlash}`
        : null;
    const [imageToDelete, setImageToDelete] = (0, react_1.useState)(null);
    const [imageToRename, setImageToRename] = (0, react_1.useState)(null);
    const [newImageName, setNewImageName] = (0, react_1.useState)('');
    const [renameError, setRenameError] = (0, react_1.useState)(null);
    const inputRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        scanImages();
    }, []);
    const imageAssets = (0, react_1.useMemo)(() => {
        return editorEngine.image.assets;
    }, [editorEngine.image.assets]);
    const scanImages = () => {
        editorEngine.image.scanImages();
    };
    const uploadImage = async (file) => {
        setUploadError(null);
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select a valid image file');
            return;
        }
        try {
            await editorEngine.image.upload(file);
        }
        catch (error) {
            setUploadError('Failed to upload image. Please try again.');
            console.error('Image upload error:', error);
        }
    };
    const handleUploadFile = async (e) => {
        const files = Array.from(e.target.files || []);
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        for (const imageFile of imageFiles) {
            await uploadImage(imageFile);
        }
    };
    const handleClickAddButton = (e) => {
        e.currentTarget.blur(); // Removes focus from the button to prevent tooltip from showing
        const input = document.getElementById('images-upload');
        if (input) {
            input.click();
        }
    };
    const filteredImages = (0, react_1.useMemo)(() => {
        if (!search.trim()) {
            return imageAssets;
        }
        const searchLower = search.toLowerCase();
        return imageAssets.filter((image) => image.fileName?.toLowerCase()?.includes(searchLower));
    }, [imageAssets, search]);
    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        e.currentTarget.removeAttribute('data-dragging-image');
        const items = Array.from(e.dataTransfer.items);
        const imageFiles = items
            .filter((item) => item.type.startsWith('image/'))
            .map((item) => item.getAsFile())
            .filter((file) => file !== null);
        for (const file of imageFiles) {
            await uploadImage(file);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const handleDragEnter = (e) => {
        e.preventDefault();
        handleDragStateChange(true, e);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget)) {
            handleDragStateChange(false, e);
        }
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
    const handleDeleteImage = (image) => {
        setImageToDelete(image);
    };
    const onDeleteImage = () => {
        if (imageToDelete) {
            editorEngine.image.delete(imageToDelete);
            setImageToDelete(null);
        }
    };
    const handleRenameImage = (image) => {
        setImageToRename(image);
        setNewImageName(image.fileName);
    };
    const handleRenameInputBlur = (value) => {
        if (value.trim() === '') {
            setRenameError('Image name cannot be empty');
            return;
        }
        if (imageToRename) {
            const extension = imageToRename.fileName.split('.').pop() || '';
            const newBaseName = value.replace(`.${extension}`, '');
            const proposedNewName = `${newBaseName}.${extension}`;
            if (proposedNewName !== imageToRename.fileName) {
                setNewImageName(proposedNewName);
            }
            else {
                setImageToRename(null);
            }
        }
    };
    const onRenameImage = async (newName) => {
        try {
            if (imageToRename && newName && newName !== imageToRename.fileName) {
                await editorEngine.image.rename(imageToRename, newName);
            }
        }
        catch (error) {
            setRenameError(error instanceof Error
                ? error.message
                : 'Failed to rename image. Please try again.');
            console.error('Image rename error:', error);
            return;
        }
        finally {
            setImageToRename(null);
            setNewImageName('');
        }
    };
    (0, react_1.useEffect)(() => {
        if (renameError) {
            const timer = setTimeout(() => {
                setRenameError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [renameError]);
    const handleImageDragStart = (e, image) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'image',
            fileName: image.fileName,
            content: image.content,
            mimeType: image.mimeType,
        }));
        for (const webview of editorEngine.webviews.webviews.values()) {
            webview.webview.style.pointerEvents = 'none';
        }
        editorEngine.mode = models_1.EditorMode.INSERT_IMAGE;
        (0, utils_1.sendAnalytics)('image drag');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setSearch('');
            inputRef.current?.blur();
        }
    };
    return (<div className="w-full h-full flex flex-col gap-2 p-3 overflow-x-hidden">
            <input type="file" accept="image/*" className="hidden" id="images-upload" onChange={handleUploadFile} multiple/>
            {uploadError && (<div className="mb-2 px-3 py-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
                    {uploadError}
                </div>)}
            {renameError && (<div className="mb-2 px-3 py-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
                    {renameError}
                </div>)}
            {!!imageAssets.length && (<div className="flex flex-row items-center gap-2 m-0">
                    <div className="relative min-w-0 flex-1">
                        <input_1.Input ref={inputRef} className="h-8 text-xs pr-8 w-full" placeholder="Search images" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown}/>
                        {search && (<button className="absolute right-[1px] top-[1px] bottom-[1px] aspect-square hover:bg-background-onlook active:bg-transparent flex items-center justify-center rounded-r-[calc(theme(borderRadius.md)-1px)] group" onClick={() => setSearch('')}>
                                <icons_1.Icons.CrossS className="h-3 w-3 text-foreground-primary/50 group-hover:text-foreground-primary"/>
                            </button>)}
                    </div>
                    <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                            <button_1.Button variant={'default'} size={'icon'} className="p-2 w-fit h-fit text-foreground-primary border-border-primary hover:border-border-onlook bg-background-secondary hover:bg-background-onlook border" onClick={handleClickAddButton}>
                                <icons_1.Icons.Plus />
                            </button_1.Button>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipPortal>
                            <tooltip_1.TooltipContent>
                                <p>Upload an image</p>
                            </tooltip_1.TooltipContent>
                        </tooltip_1.TooltipPortal>
                    </tooltip_1.Tooltip>
                </div>)}
            <div className={(0, utils_2.cn)('flex-1 overflow-y-auto', '[&[data-dragging-image=true]]:bg-teal-500/40', isDragging && 'cursor-copy')} onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}>
                {imageAssets.length === 0 ? (<div className="h-full flex items-center justify-center text-center opacity-70">
                        <div>
                            <button_1.Button onClick={handleClickAddButton} variant={'ghost'} size={'icon'} className="p-2 w-fit h-fit hover:bg-background-onlook">
                                <icons_1.Icons.Plus />
                            </button_1.Button>
                            <span className="block w-2/3 mx-auto text-xs">
                                Upload images using the Plus icon
                            </span>
                        </div>
                    </div>) : filteredImages.length === 0 ? (<div className="flex items-center justify-center h-32 text-xs text-foreground-primary/50">
                        No images found
                    </div>) : (<div className="w-full grid grid-cols-2 gap-3 p-0">
                        {filteredImages.map((image) => (<div key={image.fileName} className="relative group w-full" draggable onDragStart={(e) => handleImageDragStart(e, image)} onDragEnd={() => {
                    for (const webview of editorEngine.webviews.webviews.values()) {
                        webview.webview.style.pointerEvents = 'auto';
                    }
                    editorEngine.mode = models_1.EditorMode.DESIGN;
                }} onMouseDown={() => (editorEngine.mode = models_1.EditorMode.INSERT_IMAGE)} onMouseUp={() => (editorEngine.mode = models_1.EditorMode.DESIGN)}>
                                <div className="w-full aspect-square flex flex-col justify-center rounded-lg overflow-hidden items-center cursor-move border-[0.5px] border-border">
                                    <img className="w-full h-full object-cover" src={image.content} alt={image.fileName}/>
                                </div>
                                <span className="text-xs block w-full text-center truncate">
                                    {imageToRename?.fileName === image.fileName ? (<input type="text" className="w-full p-1 text-center bg-background-active rounded " defaultValue={image.fileName.replace(/\.[^/.]+$/, '')} autoFocus onBlur={(e) => handleRenameInputBlur(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.currentTarget.blur();
                        }
                        if (e.key === 'Escape') {
                            setImageToRename(null);
                        }
                    }}/>) : (image.fileName)}
                                </span>
                                <div className={`absolute right-2 top-2 ${activeDropdown === image.fileName
                    ? 'opacity-100'
                    : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300`}>
                                    <dropdown_menu_1.DropdownMenu onOpenChange={(isOpen) => setActiveDropdown(isOpen ? image.fileName : null)}>
                                        <dropdown_menu_1.DropdownMenuTrigger>
                                            <button_1.Button variant={'ghost'} className="bg-background p-1 inline-flex items-center justify-center h-auto w-auto rounded shadow-sm">
                                                <icons_1.Icons.DotsHorizontal className="text-foreground dark:text-white w-4 h-4"/>
                                            </button_1.Button>
                                        </dropdown_menu_1.DropdownMenuTrigger>
                                        <dropdown_menu_1.DropdownMenuContent className="rounded-md bg-background" align="start" side="right">
                                            <dropdown_menu_1.DropdownMenuItem asChild>
                                                <button_1.Button onClick={() => handleRenameImage(image)} variant={'ghost'} className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group">
                                                    <span className="flex w-full text-smallPlus items-center">
                                                        <icons_1.Icons.Pencil className="mr-2 h-4 w-4 text-foreground-secondary group-hover:text-foreground-active"/>
                                                        <span>Rename</span>
                                                    </span>
                                                </button_1.Button>
                                            </dropdown_menu_1.DropdownMenuItem>
                                            <dropdown_menu_1.DropdownMenuItem asChild>
                                                <button_1.Button variant={'ghost'} className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group" onClick={() => handleDeleteImage(image)}>
                                                    <span className="flex w-full text-smallPlus items-center">
                                                        <icons_1.Icons.Trash className="mr-2 h-4 w-4 text-foreground-secondary group-hover:text-foreground-active"/>
                                                        <span>Delete</span>
                                                    </span>
                                                </button_1.Button>
                                            </dropdown_menu_1.DropdownMenuItem>
                                            <dropdown_menu_1.DropdownMenuItem asChild>
                                                <button_1.Button variant={'ghost'} className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group" onClick={() => {
                    if (!imageFolder || !image.folder) {
                        return;
                    }
                    (0, utils_1.invokeMainChannel)(constants_1.MainChannels.OPEN_IN_EXPLORER, `${imageFolder}${image.folder}`);
                }}>
                                                    <span className="flex w-full text-smallPlus items-center">
                                                        <icons_1.Icons.DirectoryOpen className="mr-2 h-4 w-4 text-foreground-secondary group-hover:text-foreground-active"/>
                                                        <span>Open Folder</span>
                                                    </span>
                                                </button_1.Button>
                                            </dropdown_menu_1.DropdownMenuItem>
                                        </dropdown_menu_1.DropdownMenuContent>
                                    </dropdown_menu_1.DropdownMenu>
                                </div>
                            </div>))}
                    </div>)}
            </div>
            <DeleteModal_1.default onDelete={onDeleteImage} isOpen={!!imageToDelete} toggleOpen={() => setImageToDelete(null)}/>
            <RenameModal_1.default onRename={onRenameImage} isOpen={!!imageToRename && !!newImageName && newImageName !== imageToRename.fileName} toggleOpen={() => {
            setImageToRename(null);
            setNewImageName('');
        }} newName={newImageName}/>
        </div>);
});
exports.default = ImagesTab;
//# sourceMappingURL=index.js.map