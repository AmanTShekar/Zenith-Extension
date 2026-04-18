"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceSelector = void 0;
const editor_1 = require("@/components/store/editor");
const constants_1 = require("@onlook/constants");
const index_1 = require("@onlook/ui/icons/index");
const select_1 = require("@onlook/ui/select");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const hover_tooltip_1 = require("../hover-tooltip");
const DeviceIcon = ({ deviceType, orientation, className }) => {
    const iconClassName = `h-3.5 w-3.5 min-h-3.5 min-w-3.5 ${className || ''}`;
    switch (deviceType) {
        case 'Phone':
            return <index_1.Icons.Mobile className={iconClassName}/>;
        case 'Desktop':
            return <index_1.Icons.Desktop className={iconClassName}/>;
        case 'Laptop':
            return <index_1.Icons.Laptop className={iconClassName}/>;
        case 'Tablet':
            return <index_1.Icons.Tablet className={iconClassName}/>;
        default:
            return <CustomIcon orientation={orientation} className={className}/>;
    }
};
const CustomIcon = ({ orientation, className }) => {
    const iconClassName = `h-3.5 w-3.5 min-h-3.5 min-w-3.5 ${className || ''}`;
    return orientation === constants_1.Orientation.Landscape ? (<index_1.Icons.Landscape className={iconClassName}/>) : (<index_1.Icons.Portrait className={iconClassName}/>);
};
exports.DeviceSelector = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const frameData = editorEngine.frames.selected[0];
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [metadata, setMetadata] = (0, react_1.useState)(() => (0, utility_1.computeWindowMetadata)(frameData?.frame.dimension.width.toString() ?? '0', frameData?.frame.dimension.height.toString() ?? '0'));
    (0, react_1.useEffect)(() => {
        setMetadata((0, utility_1.computeWindowMetadata)(frameData?.frame.dimension.width.toString() ?? '0', frameData?.frame.dimension.height.toString() ?? '0'));
    }, [frameData?.frame.dimension.width, frameData?.frame.dimension.height]);
    if (!frameData)
        return null;
    const deviceType = (0, react_1.useMemo)(() => (0, utility_1.getDeviceType)(metadata.device), [metadata.device]);
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
    const handleDeviceChange = (value) => {
        setDevice(value);
        const [category, deviceName] = value.split(':');
        if (category &&
            deviceName &&
            constants_1.DEVICE_OPTIONS[category]?.[deviceName] &&
            deviceName !== 'Custom') {
            const [w, h] = constants_1.DEVICE_OPTIONS[category][deviceName].split('x').map(Number);
            if (typeof w === 'number' && !isNaN(w) && typeof h === 'number' && !isNaN(h)) {
                const roundedWidth = Math.round(w);
                const roundedHeight = Math.round(h);
                editorEngine.frames.updateAndSaveToStorage(frameData.frame.id, { dimension: { width: roundedWidth, height: roundedHeight } });
            }
        }
    };
    return (<select_1.Select value={device} onValueChange={handleDeviceChange} onOpenChange={setIsOpen}>
            <hover_tooltip_1.HoverOnlyTooltip content="Device" side="bottom" sideOffset={10} disabled={isOpen}>
                <select_1.SelectTrigger size="sm" className="group flex items-center gap-2 text-muted-foreground dark:bg-transparent border border-border/0 cursor-pointer rounded-lg hover:bg-background-tertiary/20 hover:text-white hover:border hover:border-border focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none">
                    <DeviceIcon deviceType={deviceType} orientation={metadata.orientation} className="group-hover:text-foreground-primary"/>
                    <span className="text-smallPlus">{deviceType}</span>
                </select_1.SelectTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <select_1.SelectContent>
                {Object.entries(constants_1.DEVICE_OPTIONS).map(([category, devices]) => (<select_1.SelectGroup key={category}>
                        <select_1.SelectLabel className="text-xs">{category}</select_1.SelectLabel>
                        {Object.entries(devices).map(([name, dimensions]) => (<select_1.SelectItem key={`${category}:${name}`} value={`${category}:${name}`} className={(0, utils_1.cn)('text-xs flex items-center cursor-pointer', device === `${category}:${name}` && 'bg-background-tertiary/50 text-foreground-primary')}>
                                <DeviceIcon deviceType={category} orientation={metadata.orientation} className={`${device === `${category}:${name}` ? 'text-foreground-primary' : 'text-foreground-onlook'}`}/>
                                {name} <span className={`text-micro ${device === `${category}:${name}` ? 'text-foreground-primary' : 'text-foreground-tertiary'}`}>{dimensions.replace('x', '×')}</span>
                            </select_1.SelectItem>))}
                        <select_1.SelectSeparator />
                    </select_1.SelectGroup>))}
            </select_1.SelectContent>
        </select_1.Select>);
});
//# sourceMappingURL=device-selector.js.map