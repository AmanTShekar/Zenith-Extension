"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeToggle = void 0;
const hotkey_1 = require("@/components/hotkey");
const editor_1 = require("@/components/store/editor");
const keys_1 = require("@/i18n/keys");
const models_1 = require("@onlook/models");
const hotkey_label_1 = require("@onlook/ui/hotkey-label");
const toggle_group_1 = require("@onlook/ui/toggle-group");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const next_intl_1 = require("next-intl");
const MODE_TOGGLE_ITEMS = [
    {
        mode: models_1.EditorMode.DESIGN,
        hotkey: hotkey_1.Hotkey.SELECT,
    },
    {
        mode: models_1.EditorMode.CODE,
        hotkey: hotkey_1.Hotkey.CODE,
    },
    {
        mode: models_1.EditorMode.PREVIEW,
        hotkey: hotkey_1.Hotkey.PREVIEW,
    },
];
exports.ModeToggle = (0, mobx_react_lite_1.observer)(() => {
    const t = (0, next_intl_1.useTranslations)();
    const editorEngine = (0, editor_1.useEditorEngine)();
    const mode = editorEngine.state.editorMode;
    const getXPosition = () => {
        if (mode === models_1.EditorMode.PREVIEW) {
            return '200%';
        }
        if (mode === models_1.EditorMode.CODE) {
            return '100%';
        }
        ;
        return '0%';
    };
    return (<div className="relative">
            <toggle_group_1.ToggleGroup className="font-normal h-7 mt-1" type="single" value={mode} onValueChange={(value) => {
            if (value) {
                editorEngine.state.editorMode = value;
            }
        }}>
                {MODE_TOGGLE_ITEMS.map((item) => (<tooltip_1.Tooltip key={item.mode}>
                        <tooltip_1.TooltipTrigger asChild>
                            <toggle_group_1.ToggleGroupItem value={item.mode} aria-label={item.hotkey.description} className={(0, utils_1.cn)('transition-all duration-150 ease-in-out px-4 py-2 whitespace-nowrap bg-transparent cursor-pointer text-sm', mode === item.mode
                ? 'text-active text-sm hover:text-active hover:bg-transparent'
                : 'text-foreground-secondary text-sm hover:text-foreground-hover hover:bg-transparent')}>
                                {t(keys_1.transKeys.editor.modes[item.mode.toLowerCase()].name)}
                            </toggle_group_1.ToggleGroupItem>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent side="bottom" className="mt-0" hideArrow>
                            <hotkey_label_1.HotkeyLabel hotkey={item.hotkey}/>
                        </tooltip_1.TooltipContent>
                    </tooltip_1.Tooltip>))}
            </toggle_group_1.ToggleGroup>
            <react_1.motion.div className="absolute -top-1 h-0.5 bg-foreground" initial={false} animate={{
            width: '33.333%',
            x: getXPosition(),
        }} transition={{
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.2,
        }}/>
        </div>);
});
//# sourceMappingURL=mode-toggle.js.map