"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const hotkeys_label_1 = require("@/components/ui/hotkeys-label");
const models_1 = require("@/lib/models");
const toggle_group_1 = require("@onlook/ui/toggle-group");
const tooltip_1 = require("@onlook/ui/tooltip");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const hotkeys_1 = require("/common/hotkeys");
const ModeToggle = (0, mobx_react_lite_1.observer)(() => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const MODE_TOGGLE_ITEMS = [
        {
            mode: models_1.EditorMode.DESIGN,
            hotkey: hotkeys_1.Hotkey.SELECT,
        },
        {
            mode: models_1.EditorMode.PREVIEW,
            hotkey: hotkeys_1.Hotkey.PREVIEW,
        },
    ];
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [mode, setMode] = (0, react_2.useState)(makeDesignMode(editorEngine.mode));
    (0, react_2.useEffect)(() => {
        setMode(makeDesignMode(editorEngine.mode));
    }, [editorEngine.mode]);
    function makeDesignMode(mode) {
        return mode === models_1.EditorMode.PREVIEW ? models_1.EditorMode.PREVIEW : models_1.EditorMode.DESIGN;
    }
    return (<div className="relative">
            <toggle_group_1.ToggleGroup className="font-normal h-7 mt-1" type="single" value={mode} onValueChange={(value) => {
            if (value) {
                editorEngine.mode = value;
                setMode(value);
            }
        }}>
                {MODE_TOGGLE_ITEMS.map((item) => (<tooltip_1.Tooltip key={item.mode}>
                        <tooltip_1.TooltipTrigger asChild>
                            <toggle_group_1.ToggleGroupItem variant={'custom-overline'} value={item.mode} aria-label={item.hotkey.description} className={`transition-all duration-150 ease-in-out px-4 py-2 whitespace-nowrap ${mode === item.mode
                ? 'text-active font-medium hover:text-active'
                : 'font-normal hover:text-foreground-hover'}`}>
                                {t(`editor.modes.${item.mode.toLowerCase()}.name`)}
                            </toggle_group_1.ToggleGroupItem>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent side="bottom">
                            <hotkeys_label_1.HotKeyLabel hotkey={item.hotkey}/>
                        </tooltip_1.TooltipContent>
                    </tooltip_1.Tooltip>))}
            </toggle_group_1.ToggleGroup>
            <react_1.motion.div className="absolute -top-1 h-0.5 bg-foreground" initial={false} animate={{
            width: '50%',
            x: mode === models_1.EditorMode.DESIGN ? '0%' : '100%',
        }} transition={{
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.2,
        }}/>
        </div>);
});
exports.default = ModeToggle;
//# sourceMappingURL=index.js.map