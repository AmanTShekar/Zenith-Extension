"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottomBar = void 0;
const hotkey_1 = require("@/components/hotkey");
const editor_1 = require("@/components/store/editor");
const keys_1 = require("@/i18n/keys");
const models_1 = require("@onlook/models");
const hotkey_label_1 = require("@onlook/ui/hotkey-label");
const icons_1 = require("@onlook/ui/icons");
const toggle_group_1 = require("@onlook/ui/toggle-group");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const next_intl_1 = require("next-intl");
const terminal_area_1 = require("./terminal-area");
const TOOLBAR_ITEMS = ({ t }) => [
    {
        mode: models_1.EditorMode.DESIGN,
        icon: icons_1.Icons.CursorArrow,
        hotkey: hotkey_1.Hotkey.SELECT,
        disabled: false,
        draggable: false,
        label: t(keys_1.transKeys.editor.toolbar.tools.select.name),
        tooltip: t(keys_1.transKeys.editor.toolbar.tools.select.tooltip),
    },
    {
        mode: models_1.EditorMode.PAN,
        icon: icons_1.Icons.Hand,
        hotkey: hotkey_1.Hotkey.PAN,
        disabled: false,
        draggable: false,
        label: t(keys_1.transKeys.editor.toolbar.tools.pan.name),
        tooltip: t(keys_1.transKeys.editor.toolbar.tools.pan.tooltip),
    },
    // {
    //     mode: InsertMode.INSERT_DIV,
    //     icon: Icons.Square,
    //     hotkey: Hotkey.INSERT_DIV,
    //     disabled: false,
    //     draggable: true,
    //     label: t(transKeys.editor.toolbar.tools.insertDiv.name),
    //     tooltip: t(transKeys.editor.toolbar.tools.insertDiv.tooltip),
    // },
    // {
    //     mode: InsertMode.INSERT_TEXT,
    //     icon: Icons.Text,
    //     hotkey: Hotkey.INSERT_TEXT,
    //     disabled: false,
    //     draggable: true,
    //     label: t(transKeys.editor.toolbar.tools.insertText.name),
    //     tooltip: t(transKeys.editor.toolbar.tools.insertText.tooltip),
    // },
];
exports.BottomBar = (0, mobx_react_lite_1.observer)(() => {
    const t = (0, next_intl_1.useTranslations)();
    const editorEngine = (0, editor_1.useEditorEngine)();
    const toolbarItems = TOOLBAR_ITEMS({ t });
    const shouldShow = editorEngine.state.editorMode === models_1.EditorMode.DESIGN || editorEngine.state.editorMode === models_1.EditorMode.PAN;
    return (<div className="absolute left-1/2 -translate-x-1/2 bottom-4 overflow-hidden">
            <react_1.AnimatePresence mode="wait">
                <react_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{
            opacity: shouldShow ? 1 : 0,
            y: shouldShow ? 0 : 20,
        }} className="flex flex-col border-[0.5px] border-border p-1 px-1 bg-background rounded-lg backdrop-blur drop-shadow-xl overflow-hidden" transition={{
            type: 'spring',
            bounce: 0.1,
            duration: 0.4,
            stiffness: 200,
            damping: 25,
        }} style={{
            pointerEvents: shouldShow ? 'auto' : 'none',
            visibility: shouldShow ? 'visible' : 'hidden'
        }}>
                    <terminal_area_1.TerminalArea>
                        <toggle_group_1.ToggleGroup type="single" value={editorEngine.state.editorMode} onValueChange={(value) => {
            if (value) {
                editorEngine.state.editorMode = value;
            }
        }} className="gap-0.5">
                            {toolbarItems.map((item) => (<tooltip_1.Tooltip key={item.mode}>
                                    <tooltip_1.TooltipTrigger asChild>
                                        <toggle_group_1.ToggleGroupItem value={item.mode} variant="default" aria-label={item.hotkey.description} disabled={item.disabled} className={(0, utils_1.cn)("h-9 w-9 flex items-center justify-center rounded-md border border-transparent transition-all duration-150 ease-in-out", editorEngine.state.editorMode === item.mode
                ? "bg-background-tertiary/50 text-foreground-primary hover:text-foreground-primary"
                : "text-foreground-tertiary hover:text-foreground-hover hover:bg-background-tertiary/50")}>
                                            <item.icon />
                                        </toggle_group_1.ToggleGroupItem>
                                    </tooltip_1.TooltipTrigger>
                                    <tooltip_1.TooltipContent sideOffset={5} hideArrow>
                                        <hotkey_label_1.HotkeyLabel hotkey={item.hotkey}/>
                                    </tooltip_1.TooltipContent>
                                </tooltip_1.Tooltip>))}
                        </toggle_group_1.ToggleGroup>
                    </terminal_area_1.TerminalArea>
                </react_1.motion.div>
            </react_1.AnimatePresence>
        </div>);
});
//# sourceMappingURL=index.js.map