"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorTopBar = void 0;
const Context_1 = require("@/components/Context");
const hotkeys_label_1 = require("@/components/ui/hotkeys-label");
const models_1 = require("@/lib/models");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const framer_motion_1 = require("framer-motion");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_i18next_1 = require("react-i18next");
const ModeToggle_1 = __importDefault(require("./ModeToggle"));
const ProjectSelect_1 = __importDefault(require("./ProjectSelect"));
const Publish_1 = __importDefault(require("./Publish"));
const hotkeys_1 = require("/common/hotkeys");
exports.EditorTopBar = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const { t } = (0, react_i18next_1.useTranslation)();
    const UNDO_REDO_BUTTONS = [
        {
            click: () => editorEngine.action.undo(),
            hotkey: hotkeys_1.Hotkey.UNDO,
            icon: <icons_1.Icons.Reset className="h-4 w-4 mr-1"/>,
            isDisabled: !editorEngine.history.canUndo,
        },
        {
            click: () => editorEngine.action.redo(),
            hotkey: hotkeys_1.Hotkey.REDO,
            icon: <icons_1.Icons.Reset className="h-4 w-4 mr-1 scale-x-[-1]"/>,
            isDisabled: !editorEngine.history.canRedo,
        },
    ];
    return (<div className="bg-background-onlook/60 backdrop-blur-sm flex flex-row h-10 p-2 justify-center items-center">
            <div className="flex flex-row flex-grow basis-0 space-x-1 justify-start items-center">
                <ProjectSelect_1.default />
            </div>
            <ModeToggle_1.default />
            <div className="flex flex-grow basis-0 justify-end items-center gap-2">
                <div className="flex flex-row items-center layout">
                    <framer_motion_1.motion.div className="space-x-0 hidden lg:block" layout transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            delay: 0,
        }}>
                        {UNDO_REDO_BUTTONS.map(({ click, hotkey, icon, isDisabled }) => (<tooltip_1.Tooltip key={hotkey.description}>
                                <tooltip_1.TooltipTrigger asChild>
                                    <span>
                                        <button_1.Button variant="ghost" size="icon" className="h-8" onClick={click} disabled={isDisabled}>
                                            {icon}
                                        </button_1.Button>
                                    </span>
                                </tooltip_1.TooltipTrigger>
                                <tooltip_1.TooltipContent side="bottom">
                                    <hotkeys_label_1.HotKeyLabel hotkey={hotkey}/>
                                </tooltip_1.TooltipContent>
                            </tooltip_1.Tooltip>))}
                    </framer_motion_1.motion.div>
                    <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                            <button_1.Button variant="ghost" size="icon" className="h-8" onClick={() => {
            editorEngine.settingsTab = models_1.SettingsTabValue.VERSIONS;
            editorEngine.isSettingsOpen = true;
        }}>
                                <icons_1.Icons.CounterClockwiseClock className="h-4 w-4"/>
                            </button_1.Button>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent side="bottom">
                            {t('editor.toolbar.versionHistory')}
                        </tooltip_1.TooltipContent>
                    </tooltip_1.Tooltip>
                </div>
                <Publish_1.default />
            </div>
        </div>);
});
//# sourceMappingURL=index.js.map