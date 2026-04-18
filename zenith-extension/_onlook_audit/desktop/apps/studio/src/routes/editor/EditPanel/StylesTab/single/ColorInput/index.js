"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBackgroundImageEmpty = void 0;
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const icons_1 = require("@onlook/ui/icons");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const ColorBrandPicker_1 = require("./ColorBrandPicker");
const stripUrlWrapper = (url) => {
    return url.replace(/^url\((['"]?)(.*)\1\)/, '$2');
};
const isBackgroundImageEmpty = (backgroundImage) => {
    if (!backgroundImage) {
        return true;
    }
    return backgroundImage === '' || backgroundImage === 'none';
};
exports.isBackgroundImageEmpty = isBackgroundImageEmpty;
const ColorTextInput = (0, react_1.memo)(({ value, isFocused, stagingInputValue, setStagingInputValue, onFocus, onBlur, backgroundImage, }) => {
    const inputValue = isFocused ? stagingInputValue : value;
    const colorValue = (0, utility_1.isColorEmpty)(inputValue) ? '' : inputValue;
    const displayValue = backgroundImage && !(0, exports.isBackgroundImageEmpty)(backgroundImage)
        ? backgroundImage
        : colorValue;
    const isUrl = backgroundImage && displayValue.startsWith('http');
    if (isFocused || !isUrl) {
        return (<input className="w-16 text-xs border-none text-active bg-transparent text-start focus:outline-none focus:ring-0" type="text" value={displayValue} placeholder="None" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.currentTarget.blur();
                }
            }} onChange={(e) => setStagingInputValue(e.target.value)} onFocus={onFocus} onBlur={onBlur}/>);
    }
    return (<p className="w-16 text-xs text-active hover:underline truncate flex items-center" onClick={(e) => {
            e.stopPropagation();
            (0, utils_1.invokeMainChannel)(constants_1.MainChannels.OPEN_EXTERNAL_WINDOW, displayValue);
        }}>
                {displayValue.split('/').pop()}
            </p>);
});
const ColorInput = (0, mobx_react_lite_1.observer)(({ elementStyle, onValueChange, compoundStyle, }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [isFocused, setIsFocused] = (0, react_1.useState)(false);
    // Memoize getColor to prevent unnecessary recalculations
    const getColor = (0, react_1.useMemo)(() => {
        if (!editorEngine.style.selectedStyle?.styles || isFocused) {
            return utility_1.Color.from(elementStyle.defaultValue);
        }
        const newValue = elementStyle.getValue(editorEngine.style.selectedStyle?.styles);
        const color = editorEngine.theme.getColorByName(newValue);
        if (color) {
            return utility_1.Color.from(color);
        }
        return utility_1.Color.from(newValue);
    }, [editorEngine.style.selectedStyle?.styles, elementStyle, isFocused, editorEngine.theme]);
    // Update color state when getColor changes
    const [color, setColor] = (0, react_1.useState)(getColor);
    (0, react_1.useEffect)(() => {
        if (!isFocused) {
            setColor(getColor);
        }
    }, [getColor, isFocused]);
    const value = (0, react_1.useMemo)(() => color.toHex(), [color]);
    // Memoize handlers to prevent unnecessary re-renders
    const sendStyleUpdate = (0, react_1.useCallback)((newValue) => {
        if (newValue instanceof utility_1.Color) {
            const valueString = newValue.toHex();
            editorEngine.style.update(elementStyle.key, valueString);
            onValueChange?.(elementStyle.key, valueString);
        }
        else {
            let colorValue = newValue.originalKey;
            if (colorValue.endsWith(constants_1.DEFAULT_COLOR_NAME)) {
                colorValue = colorValue.split(`-${constants_1.DEFAULT_COLOR_NAME}`)[0];
            }
            editorEngine.style.updateCustom(elementStyle.key, colorValue);
            onValueChange?.(elementStyle.key, newValue.lightColor);
        }
    }, [editorEngine.style, elementStyle.key, onValueChange]);
    const [stagingInputValue, setStagingInputValue] = (0, react_1.useState)(value);
    const [prevInputValue, setPrevInputValue] = (0, react_1.useState)(value);
    const getBackgroundImage = (0, react_1.useCallback)(() => {
        if (!compoundStyle) {
            return undefined;
        }
        if (!editorEngine.style.selectedStyle?.styles) {
            return undefined;
        }
        const backgroundImage = compoundStyle.children.find((child) => child.key === 'backgroundImage');
        if (!backgroundImage) {
            return undefined;
        }
        const backgroundWrapped = backgroundImage.getValue(editorEngine.style.selectedStyle?.styles);
        return stripUrlWrapper(backgroundWrapped);
    }, [compoundStyle, editorEngine.style.selectedStyle?.styles]);
    const backgroundImage = (0, react_1.useMemo)(() => getBackgroundImage(), [getBackgroundImage]);
    const handleColorButtonClick = (0, react_1.useCallback)(() => {
        if (!(0, exports.isBackgroundImageEmpty)(backgroundImage)) {
            editorEngine.image.remove();
            return;
        }
        const newValue = (0, utility_1.isColorEmpty)(value) ? utility_1.Color.black : utility_1.Color.transparent;
        sendStyleUpdate(newValue);
    }, [value, sendStyleUpdate, backgroundImage]);
    const handleFocus = (0, react_1.useCallback)(() => {
        setStagingInputValue(value);
        setPrevInputValue(value);
        setIsFocused(true);
        editorEngine.history.startTransaction();
    }, [value, editorEngine.history]);
    const handleBlur = (0, react_1.useCallback)((e) => {
        if (prevInputValue !== e.currentTarget.value) {
            const formattedColor = utility_1.Color.from(e.currentTarget.value);
            sendStyleUpdate(formattedColor);
        }
        setIsFocused(false);
        editorEngine.history.commitTransaction();
    }, [prevInputValue, sendStyleUpdate, editorEngine.history]);
    const renderButtonIcon = () => {
        if (!(0, exports.isBackgroundImageEmpty)(backgroundImage)) {
            return <icons_1.Icons.CrossS />;
        }
        if ((0, utility_1.isColorEmpty)(value)) {
            return <icons_1.Icons.Plus />;
        }
        return <icons_1.Icons.CrossS />;
    };
    return (<div className="w-32 p-[6px] gap-2 flex flex-row rounded cursor-pointer bg-background-onlook/75">
                <ColorBrandPicker_1.BrandPopoverPicker color={color} onChange={sendStyleUpdate} onChangeEnd={sendStyleUpdate} backgroundImage={backgroundImage} compoundStyle={compoundStyle}/>

                {/* <PopoverPicker
                color={color}
                onChange={sendStyleUpdate}
                onChangeEnd={sendStyleUpdate}
                backgroundImage={backgroundImage}
                compoundStyle={compoundStyle}
            /> */}

                <ColorTextInput value={value} isFocused={isFocused} stagingInputValue={stagingInputValue} setStagingInputValue={setStagingInputValue} onFocus={handleFocus} onBlur={handleBlur} backgroundImage={backgroundImage}/>
                <button className="text-foreground-onlook" onClick={handleColorButtonClick}>
                    {renderButtonIcon()}
                </button>
            </div>);
});
ColorInput.displayName = 'ColorInput';
ColorTextInput.displayName = 'ColorTextInput';
exports.default = (0, react_1.memo)(ColorInput);
//# sourceMappingURL=index.js.map