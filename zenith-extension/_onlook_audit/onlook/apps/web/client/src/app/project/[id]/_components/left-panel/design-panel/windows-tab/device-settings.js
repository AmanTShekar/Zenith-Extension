"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceSettings = void 0;
const editor_1 = require("@/components/store/editor");
const assets_1 = require("@onlook/models/assets");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
exports.DeviceSettings = (0, mobx_react_lite_1.observer)(({ frameId }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const frameData = editorEngine.frames.get(frameId);
    const [theme, setTheme] = (0, react_1.useState)(assets_1.SystemTheme.SYSTEM);
    (0, react_1.useEffect)(() => {
        if (!frameData?.view) {
            console.error('No frame view found');
            return;
        }
        frameData.view.getTheme().then((theme) => setTheme(theme));
    }, [frameData]);
    if (!frameData) {
        return (<p className="text-sm text-foreground-primary">Frame not found</p>);
    }
    async function changeTheme(newTheme) {
        const previousTheme = theme;
        setTheme(newTheme);
        if (!frameData?.view) {
            console.error('No frame view found');
            return;
        }
        const success = await frameData?.view.setTheme(newTheme);
        if (!success) {
            sonner_1.toast.error('Failed to change theme');
            setTheme(previousTheme);
        }
    }
    return (<div className="flex flex-col gap-2">
            <p className="text-sm text-foreground-primary">Device Settings</p>
            <div className="flex flex-row justify-between items-center">
                <span className="text-xs text-foreground-secondary">Theme</span>
                <div className="flex flex-row p-0.5 w-3/5 bg-background-secondary rounded">
                    <button_1.Button size={'icon'} className={`flex-1 h-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${theme === assets_1.SystemTheme.SYSTEM
            ? 'bg-background-tertiary hover:bg-background-tertiary'
            : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`} variant={'ghost'} onClick={() => changeTheme(assets_1.SystemTheme.SYSTEM)}>
                        <icons_1.Icons.Laptop />
                    </button_1.Button>
                    <button_1.Button size={'icon'} className={`flex-1 h-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${theme === assets_1.SystemTheme.DARK
            ? 'bg-background-tertiary hover:bg-background-tertiary'
            : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`} variant={'ghost'} onClick={() => changeTheme(assets_1.SystemTheme.DARK)}>
                        <icons_1.Icons.Moon />
                    </button_1.Button>
                    <button_1.Button size={'icon'} className={`flex-1 h-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${theme === assets_1.SystemTheme.LIGHT
            ? 'bg-background-tertiary hover:bg-background-tertiary'
            : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`} variant={'ghost'} onClick={() => changeTheme(assets_1.SystemTheme.LIGHT)}>
                        <icons_1.Icons.Sun />
                    </button_1.Button>
                </div>
            </div>
        </div>);
});
//# sourceMappingURL=device-settings.js.map