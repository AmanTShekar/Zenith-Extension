"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const separator_1 = require("@onlook/ui/separator");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_i18next_1 = require("react-i18next");
const DeviceSettings_1 = __importDefault(require("./DeviceSettings"));
const FrameDimensions_1 = __importDefault(require("./FrameDimensions"));
const WindowsTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const { t } = (0, react_i18next_1.useTranslation)();
    let settings = null;
    // Get settings from the selected element or webview
    if (editorEngine.elements.selected.length > 0) {
        settings = editorEngine.canvas.getFrame(editorEngine.elements.selected[0].webviewId);
    }
    else if (editorEngine.webviews.selected.length > 0) {
        settings = editorEngine.canvas.getFrame(editorEngine.webviews.selected[0].id);
    }
    const WIDTH = 'w-[275px]';
    if (!settings) {
        return (<p className={`${WIDTH} h-full flex items-center justify-center p-2 text-center text-sm text-foreground-secondary`}>
                {t('editor.panels.layers.tabs.windows.emptyState')}
            </p>);
    }
    return (<div className={`${WIDTH} flex flex-col gap-3 p-4`}>
            <div className="flex flex-row gap-1">
                <button_1.Button variant={'outline'} className="h-fit py-1.5 px-2.5 text-foreground-tertiary w-full items-center" onClick={() => editorEngine.duplicateWindow(settings.id)}>
                    <icons_1.Icons.Copy className="mr-2"/>
                    <span className="text-xs">Duplicate</span>
                </button_1.Button>
                <button_1.Button variant={'outline'} className="h-fit py-1.5 px-2.5 text-foreground-tertiary w-full items-center" disabled={!editorEngine.canDeleteWindow()} onClick={() => editorEngine.deleteWindow(settings.id)}>
                    <icons_1.Icons.Trash className="mr-2"/>
                    <span className="text-xs">Delete</span>
                </button_1.Button>
            </div>

            <FrameDimensions_1.default settings={settings}/>
            <separator_1.Separator />
            <DeviceSettings_1.default settings={settings}/>
        </div>);
});
exports.default = WindowsTab;
//# sourceMappingURL=index.js.map