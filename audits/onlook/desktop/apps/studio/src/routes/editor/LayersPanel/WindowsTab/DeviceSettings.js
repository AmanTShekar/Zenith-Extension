"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const react_1 = require("react");
const DeviceSettings = ({ settings }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [deviceTheme, setDeviceTheme] = (0, react_1.useState)(settings.theme);
    (0, react_1.useEffect)(() => {
        setDeviceTheme(settings.theme);
    }, [settings.id]);
    (0, react_1.useEffect)(() => {
        const observer = (newSettings) => {
            if (newSettings.theme !== deviceTheme) {
                setDeviceTheme(newSettings.theme);
            }
        };
        editorEngine.canvas.observeSettings(settings.id, observer);
        return editorEngine.canvas.unobserveSettings(settings.id, observer);
    }, []);
    async function changeTheme(theme) {
        const webview = editorEngine.webviews.getWebview(settings.id);
        if (!webview) {
            return;
        }
        const themeValue = theme === constants_1.Theme.System ? 'device' : theme === constants_1.Theme.Dark ? 'dark' : 'light';
        webview.executeJavaScript(`window.api?.setTheme("${themeValue}")`).then((res) => {
            setDeviceTheme(theme);
        });
        editorEngine.canvas.saveFrame(settings.id, {
            theme: theme,
        });
    }
    return (<div className="flex flex-col gap-2">
            <p className="text-smallPlus text-foreground-primary">Device Settings</p>
            <div className="flex flex-row justify-between items-center">
                <span className="text-xs text-foreground-secondary">Theme</span>
                <div className="flex flex-row p-0.5 w-3/5 bg-background-secondary rounded">
                    <button_1.Button size={'icon'} className={`h-full w-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${deviceTheme === constants_1.Theme.System
            ? 'bg-background-tertiary hover:bg-background-tertiary'
            : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`} variant={'ghost'} onClick={() => changeTheme(constants_1.Theme.System)}>
                        <index_1.Icons.Laptop />
                    </button_1.Button>
                    <button_1.Button size={'icon'} className={`h-full w-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${deviceTheme === constants_1.Theme.Dark
            ? 'bg-background-tertiary hover:bg-background-tertiary'
            : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`} variant={'ghost'} onClick={() => changeTheme(constants_1.Theme.Dark)}>
                        <index_1.Icons.Moon />
                    </button_1.Button>
                    <button_1.Button size={'icon'} className={`h-full w-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${deviceTheme === constants_1.Theme.Light
            ? 'bg-background-tertiary hover:bg-background-tertiary'
            : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`} variant={'ghost'} onClick={() => changeTheme(constants_1.Theme.Light)}>
                        <index_1.Icons.Sun />
                    </button_1.Button>
                </div>
            </div>
        </div>);
};
exports.default = DeviceSettings;
//# sourceMappingURL=DeviceSettings.js.map