"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
var ImageFit;
(function (ImageFit) {
    ImageFit["FILL"] = "fill";
    ImageFit["FIT"] = "fit";
    ImageFit["AUTO"] = "auto";
    ImageFit["TILE"] = "tile";
})(ImageFit || (ImageFit = {}));
const IMAGE_FIT_OPTIONS = [
    { value: ImageFit.FILL, label: 'Fill' },
    { value: ImageFit.FIT, label: 'Fit' },
    { value: ImageFit.AUTO, label: 'Auto' },
    { value: ImageFit.TILE, label: 'Tile' },
];
const FitToStyle = {
    [ImageFit.FILL]: {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    },
    [ImageFit.FIT]: {
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    },
    [ImageFit.AUTO]: {
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    },
    [ImageFit.TILE]: {
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
    },
};
const ImagePickerContent = ({ backgroundImage, compoundStyle, }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const getDefaultImageData = () => {
        const selectedStyle = editorEngine.style.selectedStyle?.styles;
        const url = backgroundImage;
        let fit = ImageFit.FILL;
        if (compoundStyle && selectedStyle) {
            const backgroundSize = compoundStyle.children
                .find((style) => style.key === 'backgroundSize')
                ?.getValue(selectedStyle);
            const backgroundRepeat = compoundStyle.children
                .find((style) => style.key === 'backgroundRepeat')
                ?.getValue(selectedStyle);
            switch (backgroundSize) {
                case 'cover':
                    fit = ImageFit.FILL;
                    break;
                case 'contain':
                    fit = backgroundRepeat === 'repeat' ? ImageFit.TILE : ImageFit.FIT;
                    break;
                case 'auto':
                    fit = ImageFit.AUTO;
                    break;
                default:
                    break;
            }
        }
        return {
            url: url || '',
            fit,
            base64: '',
            mimeType: '',
        };
    };
    const [imageData, setImageData] = (0, react_1.useState)(getDefaultImageData());
    const handleDragOver = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find((file) => file.type.startsWith('image/'));
        if (imageFile) {
            saveImage(imageFile);
        }
    }, []);
    const handleFileSelect = (0, react_1.useCallback)((e) => {
        const files = Array.from(e.target.files || []);
        const imageFile = files.find((file) => file.type.startsWith('image/'));
        if (imageFile) {
            saveImage(imageFile);
        }
    }, []);
    const handleButtonClick = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        document.getElementById('image-upload')?.click();
    }, []);
    const saveImage = async (file) => {
        const url = URL.createObjectURL(file);
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
            const newImageData = {
                url,
                base64: reader.result,
                mimeType: file.type,
                fit: imageData?.fit || ImageFit.FILL,
            };
            setImageData(newImageData);
            editorEngine.image.insert(newImageData.base64, newImageData.mimeType);
        };
        reader.readAsDataURL(blob);
    };
    const updateImageFit = (fit) => {
        if (!imageData) {
            return;
        }
        const updatedImageData = { ...imageData, fit };
        setImageData(updatedImageData);
        editorEngine.style.updateMultiple(FitToStyle[fit]);
    };
    return (<div className="flex flex-col items-center gap-2 p-2 text-xs">
            <div className={`group h-32 w-full bg-background-secondary rounded flex items-center justify-center p-4 
                    ${isDragging ? 'border-2 border-dashed border-primary' : ''}`} style={{
            backgroundImage: imageData ? `url(${imageData.url})` : 'none',
            ...FitToStyle[imageData?.fit || ImageFit.FILL],
        }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <UploadButton onButtonClick={handleButtonClick}/>
                <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={handleFileSelect}/>
            </div>

            <dropdown_menu_1.DropdownMenu>
                <dropdown_menu_1.DropdownMenuTrigger className="px-2 py-1 w-full flex items-center justify-between bg-background-secondary rounded text-foreground-primary hover:bg-background-secondary/90 transition-colors">
                    <span className="capitalize">{imageData?.fit || ImageFit.FILL}</span>
                    <icons_1.Icons.ChevronDown className="w-4 h-4"/>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent className="w-52">
                    {IMAGE_FIT_OPTIONS.map(({ value, label }) => (<dropdown_menu_1.DropdownMenuItem key={value} className="text-xs" onClick={() => updateImageFit(value)}>
                            {label}
                        </dropdown_menu_1.DropdownMenuItem>))}
                </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
        </div>);
};
const UploadButton = (0, react_1.memo)(({ onButtonClick }) => (<button_1.Button variant="secondary" className="flex items-center gap-2 px-4 py-0 backdrop-blur-sm rounded border border-foreground-tertiary/20 opacity-0 group-hover:opacity-90 transition-opacity" type="button" onClick={onButtonClick}>
            <icons_1.Icons.Upload className="w-3 h-3"/>
            <span>Upload New Image</span>
        </button_1.Button>));
UploadButton.displayName = 'UploadButton';
exports.default = (0, react_1.memo)(ImagePickerContent);
//# sourceMappingURL=ImagePicker.js.map