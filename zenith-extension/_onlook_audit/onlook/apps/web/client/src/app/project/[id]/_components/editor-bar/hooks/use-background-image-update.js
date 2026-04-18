"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBackgroundImage = exports.IMAGE_FIT_OPTIONS = exports.ImageFit = void 0;
const sonner_1 = require("@onlook/ui/sonner");
const react_1 = require("react");
var ImageFit;
(function (ImageFit) {
    ImageFit["FILL"] = "fill";
    ImageFit["FIT"] = "fit";
    ImageFit["STRETCH"] = "stretch";
    ImageFit["CENTER"] = "center";
    ImageFit["TILE"] = "tile";
    ImageFit["AUTO"] = "auto";
})(ImageFit || (exports.ImageFit = ImageFit = {}));
exports.IMAGE_FIT_OPTIONS = [
    { value: ImageFit.FILL, label: 'Fill' },
    { value: ImageFit.FIT, label: 'Fit' },
    { value: ImageFit.STRETCH, label: 'Stretch' },
    { value: ImageFit.CENTER, label: 'Center' },
    { value: ImageFit.TILE, label: 'Tile' },
    { value: ImageFit.AUTO, label: 'Auto' },
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
    [ImageFit.STRETCH]: {
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    },
    [ImageFit.CENTER]: {
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    },
    [ImageFit.TILE]: {
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
    },
    [ImageFit.AUTO]: {
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    },
};
const cssToImageFit = (backgroundSize, backgroundRepeat) => {
    if (backgroundSize === 'cover')
        return ImageFit.FILL;
    if (backgroundSize === 'contain')
        return ImageFit.FIT;
    if (backgroundSize === '100% 100%')
        return ImageFit.STRETCH;
    if (backgroundSize === 'auto' && backgroundRepeat === 'repeat')
        return ImageFit.TILE;
    if (backgroundSize === 'auto')
        return ImageFit.CENTER;
    return ImageFit.AUTO;
};
const useBackgroundImage = (editorEngine) => {
    const [fillOption, setFillOption] = (0, react_1.useState)(ImageFit.FILL);
    const currentBackgroundImage = (0, react_1.useMemo)(() => {
        const selectedImage = editorEngine.style.selectedStyle?.styles.computed.backgroundImage;
        if (selectedImage && selectedImage !== 'none') {
            return selectedImage;
        }
        return null;
    }, [editorEngine.style.selectedStyle?.styles.computed.backgroundImage]);
    const currentBackgroundSize = (0, react_1.useMemo)(() => {
        const selectedStyle = editorEngine.style.selectedStyle?.styles.computed.backgroundSize;
        const selectedRepeat = editorEngine.style.selectedStyle?.styles.computed.backgroundRepeat;
        if (!selectedStyle)
            return null;
        return cssToImageFit(selectedStyle, selectedRepeat ?? 'no-repeat');
    }, [
        editorEngine.style.selectedStyle?.styles.computed.backgroundSize,
        editorEngine.style.selectedStyle?.styles.computed.backgroundRepeat,
    ]);
    const applyFillOption = (0, react_1.useCallback)((fillOptionValue) => {
        try {
            const selected = editorEngine.elements.selected;
            if (!selected || selected.length === 0) {
                console.warn('No elements selected to apply fill option');
                return;
            }
            const cssStyles = FitToStyle[fillOptionValue];
            editorEngine.style.updateMultiple(cssStyles);
        }
        catch (error) {
            console.error('Failed to apply fill option:', error);
            sonner_1.toast.error('Failed to apply fill option', {
                description: error instanceof Error ? error.message : String(error),
            });
        }
    }, []);
    const handleFillOptionChange = (0, react_1.useCallback)((option) => {
        setFillOption(option);
        applyFillOption(option);
    }, [applyFillOption]);
    const removeBackground = (0, react_1.useCallback)(async () => {
        try {
            const styles = {
                backgroundImage: 'none',
                backgroundSize: 'auto',
                backgroundRepeat: 'repeat',
                backgroundPosition: 'auto',
            };
            editorEngine.style.updateMultiple(styles);
            editorEngine.image.setSelectedImage(null);
            editorEngine.image.setPreviewImage(null);
        }
        catch (error) {
            console.error('Failed to remove background:', error);
            sonner_1.toast.error('Failed to remove background', {
                description: error instanceof Error ? error.message : String(error),
            });
        }
    }, [editorEngine]);
    (0, react_1.useEffect)(() => {
        if (currentBackgroundSize) {
            setFillOption(currentBackgroundSize);
        }
    }, [currentBackgroundSize]);
    (0, react_1.useEffect)(() => {
        return () => {
            if (editorEngine.image.isSelectingImage) {
                editorEngine.image.setIsSelectingImage(false);
                editorEngine.image.setSelectedImage(null);
                editorEngine.image.setPreviewImage(null);
            }
        };
    }, [editorEngine]);
    return {
        fillOption,
        currentBackgroundImage,
        handleFillOptionChange,
        removeBackground,
        ImageFit,
        IMAGE_FIT_OPTIONS: exports.IMAGE_FIT_OPTIONS,
    };
};
exports.useBackgroundImage = useBackgroundImage;
//# sourceMappingURL=use-background-image-update.js.map