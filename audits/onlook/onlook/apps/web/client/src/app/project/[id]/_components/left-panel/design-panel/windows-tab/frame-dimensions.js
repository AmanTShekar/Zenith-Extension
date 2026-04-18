"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameDimensions = void 0;
const editor_1 = require("@/components/store/editor");
const constants_1 = require("@onlook/constants");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const select_1 = require("@onlook/ui/select");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = __importStar(require("react"));
exports.FrameDimensions = (0, mobx_react_lite_1.observer)(({ frameId }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const frameData = editorEngine.frames.get(frameId);
    if (!frameData) {
        return (<p className="text-sm text-foreground-primary">Frame not found</p>);
    }
    const [metadata, setMetadata] = (0, react_1.useState)(() => (0, utility_1.computeWindowMetadata)(frameData.frame.dimension.width.toString(), frameData.frame.dimension.height.toString()));
    const [device, setDevice] = (0, react_1.useState)(() => {
        for (const category in constants_1.DEVICE_OPTIONS) {
            for (const deviceName in constants_1.DEVICE_OPTIONS[category]) {
                const res = constants_1.DEVICE_OPTIONS[category][deviceName];
                if (res === `${metadata.width}x${metadata.height}`) {
                    return `${category}:${deviceName}`;
                }
            }
        }
        return 'Custom:Custom';
    });
    const updateFrame = (width, height) => {
        const roundedWidth = Math.round(width);
        const roundedHeight = Math.round(height);
        const newMetadata = (0, utility_1.computeWindowMetadata)(roundedWidth.toString(), roundedHeight.toString());
        setMetadata(newMetadata);
        editorEngine.frames.updateAndSaveToStorage(frameData.frame.id, { dimension: { width: roundedWidth, height: roundedHeight } });
    };
    const handleDimensionInput = (event, dimension) => {
        const value = parseInt(event.target.value);
        if (isNaN(value))
            return;
        if (dimension === 'width') {
            updateFrame(value, metadata.height);
        }
        else {
            updateFrame(metadata.width, value);
        }
    };
    const handleOrientationChange = () => {
        if (metadata.width >= parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width) &&
            metadata.height >= parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height)) {
            updateFrame(metadata.height, metadata.width);
        }
    };
    const handleDeviceChange = (value) => {
        setDevice(value);
        const [category, deviceName] = value.split(':');
        if (category &&
            deviceName &&
            constants_1.DEVICE_OPTIONS[category] &&
            constants_1.DEVICE_OPTIONS[category][deviceName] &&
            deviceName !== 'Custom') {
            const [w, h] = constants_1.DEVICE_OPTIONS[category][deviceName].split('x').map(Number);
            if (typeof w === 'number' && !isNaN(w) && typeof h === 'number' && !isNaN(h)) {
                updateFrame(w, h);
            }
        }
    };
    return (<div className="flex flex-col gap-2">
            <p className="text-sm text-foreground-primary">Frame Dimensions</p>
            <div className="flex flex-row justify-between items-center">
                <span className="text-xs text-foreground-secondary">Device</span>
                <select_1.Select value={device} onValueChange={handleDeviceChange}>
                    <select_1.SelectTrigger className="w-3/5 bg-background-secondary border-background-secondary py-1.5 px-2 h-fit text-xs rounded focus:outline-none focus:ring-0">
                        <select_1.SelectValue placeholder="Select device"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent className="rounded-md bg-background-secondary">
                        {Object.entries(constants_1.DEVICE_OPTIONS).map(([category, devices], index) => category !== 'Custom' ? (<react_1.default.Fragment key={index}>
                                    <select_1.SelectGroup key={index}>
                                        <select_1.SelectLabel>{category}</select_1.SelectLabel>
                                        {Object.entries(devices).map(([deviceName], idx) => (<select_1.SelectItem key={idx} value={category + ':' + deviceName} className="focus:bg-background-tertiary rounded-md text-xs cursor-pointer">
                                                {deviceName}
                                            </select_1.SelectItem>))}
                                    </select_1.SelectGroup>
                                    {index < Object.entries(constants_1.DEVICE_OPTIONS).length - 1 && (<select_1.SelectSeparator className="text-white"/>)}
                                </react_1.default.Fragment>) : (<select_1.SelectItem key={'Custom'} value={'Custom:Custom'} className="focus:bg-background-tertiary rounded-md text-xs cursor-pointer">
                                    {'Custom'}
                                </select_1.SelectItem>))}
                    </select_1.SelectContent>
                </select_1.Select>
            </div>

            <div className="flex flex-row justify-between items-center">
                <span className="text-xs text-foreground-secondary">Orientation</span>
                <div className="flex flex-row p-0.5 w-3/5 bg-background-secondary rounded">
                    <button_1.Button size={'icon'} className={`flex-1 h-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${metadata.orientation === constants_1.Orientation.Portrait ? 'bg-background-tertiary hover:bg-background-tertiary' : 'hover:bg-background-tertiary/50'}`} variant={'ghost'} onClick={handleOrientationChange}>
                        <icons_1.Icons.Portrait className={`h-4 w-4 ${metadata.orientation !== constants_1.Orientation.Portrait ? 'text-foreground-secondary hover:text-foreground-onlook' : ''}`}/>
                    </button_1.Button>
                    <button_1.Button size={'icon'} className={`flex-1 h-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${metadata.orientation === constants_1.Orientation.Landscape ? 'bg-background-tertiary hover:bg-background-tertiary' : 'hover:bg-background-tertiary/50'}`} variant={'ghost'} onClick={handleOrientationChange}>
                        <icons_1.Icons.Landscape className={`h-4 w-4 ${metadata.orientation !== constants_1.Orientation.Landscape ? 'text-foreground-secondary hover:text-foreground-onlook' : ''}`}/>
                    </button_1.Button>
                </div>
            </div>

            <div className="flex flex-row justify-between items-center relative">
                <span className="text-xs text-foreground-secondary">Width</span>
                <div className="relative w-3/5">
                    <input_1.Input className="w-full px-2 h-8 text-xs rounded border-none text-foreground-active bg-background-secondary text-start focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={metadata.width} min={parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width)} type="number" onChange={(event) => handleDimensionInput(event, 'width')}/>
                    <p className="p-0 h-fit w-fit absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground-secondary text-xs">
                        px
                    </p>
                </div>
            </div>

            <div className="flex flex-row justify-between items-center relative">
                <span className="text-xs text-foreground-secondary">Height</span>
                <div className="relative w-3/5">
                    <input_1.Input className="w-full px-2 h-8 text-xs rounded border-none text-foreground-active bg-background-secondary text-start focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={metadata.height} min={parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height)} type="number" onChange={(event) => handleDimensionInput(event, 'height')}/>
                    <p className="p-0 h-fit w-fit absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground-secondary text-xs">
                        px
                    </p>
                </div>
            </div>
        </div>);
});
//# sourceMappingURL=frame-dimensions.js.map