"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedSettingsSection = void 0;
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const AdvancedSettingsSection = () => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const openAdvancedSettings = () => {
        editorEngine.isPublishOpen = false;
        editorEngine.settingsTab = models_1.SettingsTabValue.DOMAIN;
        editorEngine.isSettingsOpen = true;
    };
    return (<button_1.Button variant="ghost" className="flex flex-row items-center gap-2 py-4 rounded-t-none h-12" onClick={openAdvancedSettings}>
            <icons_1.Icons.Gear className="h-4 w-4"/>
            Advanced Settings
            <icons_1.Icons.ChevronRight className="ml-auto h-3 w-3"/>
        </button_1.Button>);
};
exports.AdvancedSettingsSection = AdvancedSettingsSection;
//# sourceMappingURL=AdvancedSettings.js.map