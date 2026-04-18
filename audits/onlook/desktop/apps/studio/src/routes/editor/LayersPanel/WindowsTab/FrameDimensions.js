"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const input_1 = require("@onlook/ui/input");
const select_1 = require("@onlook/ui/select");
const separator_1 = require("@onlook/ui/separator");
const react_1 = require("react");
const deviceOptions = {
    Custom: {
        Custom: 'Custom',
    },
    Phone: {
        'Android Compact': '412x917',
        'Android Medium': '700x840',
        'Android Small': '360x640',
        'Android Large': '360x800',
        'iPhone 16': '393x852',
        'iPhone 16 Pro': '402x874',
        'iPhone 16 Pro Max': '440x956',
        'iPhone 16 Plus': '430x932',
        'iPhone 14 & 15 Pro': '430x932',
        'iPhone 14 & 15': '393x852',
        'iPhone 13 & 14': '390x844',
        'iPhone 13 Pro Max': '428x926',
        'iPhone 13 / 13 Pro': '390x844',
        'iPhone 11 Pro Max': '414x896',
        'iPhone 11 Pro / X': '375x812',
        'iPhone 8 Plus': '414x736',
        'iPhone 8': '375x667',
        'iPhone SE': '320x568',
    },
    Tablet: {
        'Android Expanded': '1280x800',
        'Surface Pro 8': '1440x960',
        'Surface Pro 4': '1368x912',
        'iPad Mini 8.3': '744x1133',
        'iPad Mini 5': '768x1024',
        'iPad Pro 11': '834x1194',
        'iPad Pro 12.9': '1024x1366',
    },
    Laptop: {
        'MacBook Air': '1280x832',
        MacBook: '1152x700',
        'MacBook Pro 14': '1512x982',
        'MacBook Pro 16': '1728x1117',
        'MacBook Pro': '1440x900',
        'Surface Book': '1500x1000',
    },
    Desktop: {
        Desktop: '1440x1024',
        Wireframe: '1440x1024',
        TV: '1280x720',
        iMac: '1280x720',
    },
};
const FrameDimensions = ({ settings }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [device, setDevice] = (0, react_1.useState)(settings.device || constants_1.DefaultSettings.DEVICE);
    const [orientation, setOrientation] = (0, react_1.useState)(settings.orientation || constants_1.DefaultSettings.ORIENTATION);
    const [width, setWidth] = (0, react_1.useState)(settings.dimension.width || constants_1.DefaultSettings.FRAME_DIMENSION.width);
    const [height, setHeight] = (0, react_1.useState)(settings.dimension.height || constants_1.DefaultSettings.FRAME_DIMENSION.height);
    // const [responsive, setResponsive] = useState('Closest Size');
    const [aspectRatioLocked, setAspectRatioLocked] = (0, react_1.useState)(settings.aspectRatioLocked || constants_1.DefaultSettings.ASPECT_RATIO_LOCKED);
    const [aspectRatio, setAspectRatio] = (0, react_1.useState)(width / height);
    const [step, setStep] = (0, react_1.useState)(1);
    const [minDimensionsAspectRatio, setMinDimensionsAspectRatio] = (0, react_1.useState)({
        height: parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height),
        width: parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width),
    });
    (0, react_1.useEffect)(() => {
        const observer = (newSettings) => {
            if (newSettings.dimension.width !== width) {
                setWidth(newSettings.dimension.width);
            }
            if (newSettings.dimension.height !== height) {
                setHeight(newSettings.dimension.height);
            }
        };
        editorEngine.canvas.observeSettings(settings.id, observer);
        return editorEngine.canvas.unobserveSettings(settings.id, observer);
    }, []);
    (0, react_1.useEffect)(() => {
        setDevice(settings.device || constants_1.DefaultSettings.DEVICE);
        setOrientation(settings.orientation || constants_1.DefaultSettings.ORIENTATION);
        setWidth(settings.dimension.width || constants_1.DefaultSettings.FRAME_DIMENSION.width);
        setHeight(settings.dimension.height || constants_1.DefaultSettings.FRAME_DIMENSION.height);
        setAspectRatioLocked(settings.aspectRatioLocked || constants_1.DefaultSettings.ASPECT_RATIO_LOCKED);
    }, [settings.id]);
    (0, react_1.useEffect)(() => {
        const [deviceCategory, deviceName] = device.split(':');
        if (deviceName === 'Custom') {
            editorEngine.canvas.saveFrame(settings.id, {
                device: device,
            });
            return;
        }
        if (!deviceOptions[deviceCategory] || !deviceOptions[deviceCategory][deviceName]) {
            setDevice('Custom:Custom');
            return;
        }
        const [deviceWidth, deviceHeight] = deviceOptions[deviceCategory][deviceName].split('x');
        if (width === parseInt(deviceHeight) && height === parseInt(deviceWidth)) {
            return;
        }
        else {
            setWidth(parseInt(deviceWidth));
            setHeight(parseInt(deviceHeight));
            editorEngine.canvas.saveFrame(settings.id, {
                dimension: { width: parseInt(deviceWidth), height: parseInt(deviceHeight) },
                device: device,
            });
            if (aspectRatioLocked) {
                setAspectRatio(parseInt(deviceWidth) / parseInt(deviceHeight));
            }
        }
    }, [device]);
    (0, react_1.useEffect)(() => {
        const [deviceCategory, deviceName] = device.split(':');
        if (!deviceOptions[deviceCategory] || !deviceOptions[deviceCategory][deviceName]) {
            setDevice('Custom:Custom');
            return;
        }
        const [deviceWidth, deviceHeight] = deviceOptions[deviceCategory][deviceName].split('x');
        if (deviceName !== 'Custom' &&
            ((width !== parseInt(deviceWidth) && width !== parseInt(deviceHeight)) ||
                (height !== parseInt(deviceHeight) && height !== parseInt(deviceWidth)))) {
            setDevice('Custom:Custom');
        }
        if (height > width && orientation !== constants_1.Orientation.Portrait && !aspectRatioLocked) {
            setOrientation(constants_1.Orientation.Portrait);
        }
        if (width > height && orientation !== constants_1.Orientation.Landscape && !aspectRatioLocked) {
            setOrientation(constants_1.Orientation.Landscape);
        }
        editorEngine.canvas.saveFrame(settings.id, {
            dimension: { width: width, height: height },
        });
    }, [height, width]);
    (0, react_1.useEffect)(() => {
        setAspectRatio(width / height);
        if (aspectRatioLocked) {
            setMinDimensionsAspectRatio({
                height: Math.max(parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height), Math.floor(parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width) / aspectRatio)),
                width: Math.max(parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width), Math.floor(parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height) * aspectRatio)),
            });
        }
        else {
            setMinDimensionsAspectRatio({
                height: parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height),
                width: parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width),
            });
        }
        editorEngine.canvas.saveFrame(settings.id, {
            aspectRatioLocked: aspectRatioLocked,
        });
    }, [aspectRatioLocked]);
    (0, react_1.useEffect)(() => {
        editorEngine.canvas.saveFrame(settings.id, {
            orientation: orientation,
        });
    }, [orientation]);
    const handleOrientationChange = () => {
        if (width >= parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width) &&
            height >= parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height)) {
            setHeight(width);
            setWidth(height);
            setOrientation(orientation === constants_1.Orientation.Landscape
                ? constants_1.Orientation.Portrait
                : constants_1.Orientation.Landscape);
        }
    };
    const handleDimensionInput = (event, dimension) => {
        const value = event.target.value;
        if (dimension === 'width') {
            setWidth(parseInt(value));
            if (aspectRatioLocked) {
                setHeight(Math.floor(parseInt(value) / aspectRatio));
            }
        }
        else if (dimension === 'height') {
            setHeight(parseInt(value));
            if (aspectRatioLocked) {
                setWidth(Math.floor(parseInt(value) * aspectRatio));
            }
        }
    };
    const handleDimensionKeyDown = (event) => {
        if (event.shiftKey) {
            setStep(10);
        }
    };
    const handleDimensionKeyUp = (event) => {
        if (event.shiftKey) {
            setStep(1);
        }
    };
    const handleDimensionInputBlur = (event, dimension) => {
        const value = event.target.value;
        if (dimension === 'width') {
            if (aspectRatioLocked) {
                if (parseInt(value) / aspectRatio <
                    parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height) ||
                    parseInt(value) < parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width)) {
                    const dimensionsAspectRatio = aspectRatio >= 1
                        ? {
                            height: parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height),
                            width: Math.floor(parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height) * aspectRatio),
                        }
                        : {
                            height: Math.floor(parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width) / aspectRatio),
                            width: parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width),
                        };
                    setHeight(dimensionsAspectRatio.height);
                    setWidth(dimensionsAspectRatio.width);
                }
            }
            else if (parseInt(value) < parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width)) {
                event.target.value = parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width).toString();
                setWidth(parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width));
            }
        }
        else if (dimension === 'height') {
            if (aspectRatioLocked) {
                if (parseInt(value) * aspectRatio <
                    parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width) ||
                    parseInt(value) < parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height)) {
                    const dimensionsAspectRatio = aspectRatio >= 1
                        ? {
                            height: parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height),
                            width: Math.floor(parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height) * aspectRatio),
                        }
                        : {
                            height: Math.floor(parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width) / aspectRatio),
                            width: parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width),
                        };
                    setHeight(dimensionsAspectRatio.height);
                    setWidth(dimensionsAspectRatio.width);
                }
            }
            else if (parseInt(value) < parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height)) {
                event.target.value = parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height).toString();
                setHeight(parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height));
            }
        }
    };
    const handleAspectRatioLock = () => {
        setAspectRatioLocked((prev) => !prev);
        editorEngine.canvas.saveFrame(settings.id, {
            aspectRatioLocked: !aspectRatioLocked,
        });
    };
    return (<div className="flex flex-col gap-2">
            <p className="text-smallPlus text-foreground-primary">Frame Dimensions</p>
            <div className="flex flex-row justify-between items-center">
                <span className="text-xs text-foreground-secondary">Device</span>
                <select_1.Select value={device} onValueChange={setDevice}>
                    <select_1.SelectTrigger className="w-3/5 bg-background-secondary border-background-secondary py-1.5 px-2 h-fit text-xs rounded focus:outline-none focus:ring-0">
                        <select_1.SelectValue placeholder="Select device"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent className="rounded-md bg-background-secondary">
                        {Object.entries(deviceOptions).map(([category, devices], index) => category !== 'Custom' ? (<react_1.Fragment key={index}>
                                    <select_1.SelectGroup key={index}>
                                        <select_1.SelectLabel>{category}</select_1.SelectLabel>
                                        {Object.entries(devices).map(([deviceName], index) => (<select_1.SelectItem key={index} value={category + ':' + deviceName} className="focus:bg-background-tertiary rounded-md text-xs cursor-pointer">
                                                {deviceName}
                                            </select_1.SelectItem>))}
                                    </select_1.SelectGroup>
                                    {index < Object.entries(deviceOptions).length - 1 && (<separator_1.Separator className="text-white"/>)}
                                </react_1.Fragment>) : (<select_1.SelectItem key={'Custom'} value={'Custom:Custom'} className="focus:bg-background-tertiary rounded-md text-xs cursor-pointer">
                                    {'Custom'}
                                </select_1.SelectItem>))}
                    </select_1.SelectContent>
                </select_1.Select>
            </div>
            <div className="flex flex-row justify-between items-center">
                <span className="text-xs text-foreground-secondary">Orientation</span>
                <div className="flex flex-row p-0.5 w-3/5 bg-background-secondary rounded">
                    <button_1.Button size={'icon'} className={`h-full w-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${orientation === constants_1.Orientation.Portrait ? 'bg-background-tertiary hover:bg-background-tertiary' : 'hover:bg-background-tertiary/50'}`} variant={'ghost'} onClick={handleOrientationChange}>
                        <index_1.Icons.Portrait className={`h-4 w-4 ${orientation !== constants_1.Orientation.Portrait ? 'text-foreground-secondary hover:text-foreground-onlook' : ''}`}/>
                    </button_1.Button>
                    <button_1.Button size={'icon'} className={`h-full w-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${orientation === 'Landscape' ? 'bg-background-tertiary hover:bg-background-tertiary' : 'hover:bg-background-tertiary/50'}`} variant={'ghost'} onClick={handleOrientationChange}>
                        <index_1.Icons.Landscape className={`h-4 w-4 ${orientation !== constants_1.Orientation.Landscape ? 'text-foreground-secondary hover:text-foreground-onlook' : ''}`}/>
                    </button_1.Button>
                </div>
            </div>
            <div className="flex flex-row justify-between items-center relative">
                <span className="text-xs text-foreground-secondary">Width</span>
                <index_1.Icons.CornerTopLeft className="absolute h-4 w-4 text-foreground-quadranary top-3 left-16 cursor-pointer z-50" onClick={handleAspectRatioLock}/>
                {aspectRatioLocked ? (<index_1.Icons.LockClosed className="absolute h-3 w-3 text-foreground-primary top-[30px] left-[61.5px] cursor-pointer z-50" onClick={handleAspectRatioLock}/>) : (<index_1.Icons.LockOpen className="absolute h-3 w-3 text-foreground-primary top-[30px] left-[61.5px] cursor-pointer z-50" onClick={handleAspectRatioLock}/>)}

                <div className="relative w-3/5">
                    <input_1.Input className="w-full px-2 h-8 text-xs rounded border-none text-foreground-active bg-background-secondary text-start focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={width} min={minDimensionsAspectRatio.width} type="number" step={step} onChange={(event) => handleDimensionInput(event, 'width')} onKeyDown={(event) => handleDimensionKeyDown(event)} onKeyUp={(event) => handleDimensionKeyUp(event)} onBlur={(event) => handleDimensionInputBlur(event, 'width')}/>
                    <p className="p-0 h-fit w-fit absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground-secondary text-xs">
                        px
                    </p>
                </div>
            </div>
            <div className="flex flex-row justify-between items-center relative">
                <span className="text-xs text-foreground-secondary">Height</span>
                <index_1.Icons.CornerBottomLeft className="absolute h-4 w-4 text-foreground-quadranary bottom-3 left-16 cursor-pointer z-50" onClick={() => setAspectRatioLocked((prev) => !prev)}/>
                <div className="relative w-3/5">
                    <input_1.Input className="w-full px-2 h-8 text-xs rounded border-none text-foreground-active bg-background-secondary text-start focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={height} min={minDimensionsAspectRatio.height} type="number" step={step} onChange={(event) => handleDimensionInput(event, 'height')} onKeyDown={(event) => handleDimensionKeyDown(event)} onKeyUp={(event) => handleDimensionKeyUp(event)} onBlur={(event) => handleDimensionInputBlur(event, 'height')}/>
                    <p className="p-0 h-fit w-fit absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground-secondary text-xs">
                        px
                    </p>
                </div>
            </div>
        </div>);
};
exports.default = FrameDimensions;
//# sourceMappingURL=FrameDimensions.js.map