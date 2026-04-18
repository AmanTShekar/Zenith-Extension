"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowsTab = void 0;
const editor_1 = require("@/components/store/editor");
const keys_1 = require("@/i18n/keys");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const separator_1 = require("@onlook/ui/separator");
const mobx_react_lite_1 = require("mobx-react-lite");
const next_intl_1 = require("next-intl");
const device_settings_1 = require("./device-settings");
const frame_dimensions_1 = require("./frame-dimensions");
exports.WindowsTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const t = (0, next_intl_1.useTranslations)();
    const WIDTH = 'w-[275px]';
    const selected = editorEngine.frames.selected;
    const emptyState = (<p className={`${WIDTH} h-full flex items-center justify-center p-2 text-center text-sm text-foreground-secondary`}>
            {t(keys_1.transKeys.editor.panels.layers.tabs.windows.emptyState)}
        </p>);
    const frameData = selected[0];
    if (selected.length === 0 || !frameData) {
        return emptyState;
    }
    const closeWindowsTab = () => {
        editorEngine.state.leftPanelTab = null;
    };
    return (<div className={`${WIDTH} flex flex-col`}>
            <div className="flex flex-row justify-between items-center px-3 py-2">
                <p className="text-sm text-foreground-primary">Window Settings</p>
                <button_1.Button onClick={closeWindowsTab} variant="ghost" size="icon" className="hover:bg-background-tertiary/20 hover:text-white hover:border hover:border-border focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none active:border-0 w-fit h-fit">
                    <icons_1.Icons.CrossL className="h-4 w-4 min-h-4 min-w-4"/>
                </button_1.Button>
            </div>
            <separator_1.Separator />
            <div className="flex flex-col gap-2 p-3">
                <frame_dimensions_1.FrameDimensions frameId={frameData.frame.id}/>
                <separator_1.Separator />
                <device_settings_1.DeviceSettings frameId={frameData.frame.id}/>
            </div>
        </div>);
});
//# sourceMappingURL=index.js.map