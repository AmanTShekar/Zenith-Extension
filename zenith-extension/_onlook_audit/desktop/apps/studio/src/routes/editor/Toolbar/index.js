"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toolbar = void 0;
const Context_1 = require("@/components/Context");
const hotkeys_label_1 = require("@/components/ui/hotkeys-label");
const models_1 = require("@/lib/models");
const icons_1 = require("@onlook/ui/icons");
const toggle_group_1 = require("@onlook/ui/toggle-group");
const tooltip_1 = require("@onlook/ui/tooltip");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const Terminal_1 = __importDefault(require("./Terminal"));
const RunButton_1 = __importDefault(require("./Terminal/RunButton"));
const hotkeys_1 = require("/common/hotkeys");
const TOOLBAR_ITEMS = ({ t }) => [
    {
        mode: models_1.EditorMode.DESIGN,
        icon: icons_1.Icons.CursorArrow,
        hotkey: hotkeys_1.Hotkey.SELECT,
        disabled: false,
        draggable: false,
        label: t('editor.toolbar.tools.select.name'),
        tooltip: t('editor.toolbar.tools.select.tooltip'),
    },
    {
        mode: models_1.EditorMode.PAN,
        icon: icons_1.Icons.Hand,
        hotkey: hotkeys_1.Hotkey.PAN,
        disabled: false,
        draggable: false,
        label: t('editor.toolbar.tools.pan.name'),
        tooltip: t('editor.toolbar.tools.pan.tooltip'),
    },
    {
        mode: models_1.EditorMode.INSERT_DIV,
        icon: icons_1.Icons.Square,
        hotkey: hotkeys_1.Hotkey.INSERT_DIV,
        disabled: false,
        draggable: true,
        label: t('editor.toolbar.tools.insertDiv.name'),
        tooltip: t('editor.toolbar.tools.insertDiv.tooltip'),
    },
    {
        mode: models_1.EditorMode.INSERT_TEXT,
        icon: icons_1.Icons.Text,
        hotkey: hotkeys_1.Hotkey.INSERT_TEXT,
        disabled: false,
        draggable: true,
        label: t('editor.toolbar.tools.insertText.name'),
        tooltip: t('editor.toolbar.tools.insertText.tooltip'),
    },
];
exports.Toolbar = (0, mobx_react_lite_1.observer)(() => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [mode, setMode] = (0, react_2.useState)(editorEngine.mode);
    const [terminalHidden, setTerminalHidden] = (0, react_2.useState)(true);
    (0, react_2.useEffect)(() => {
        setMode(editorEngine.mode);
    }, [editorEngine.mode]);
    const createDragPreview = (properties) => {
        const preview = document.createElement('div');
        Object.assign(preview.style, {
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...properties.styles,
        });
        if (properties.textContent) {
            preview.textContent = properties.textContent;
        }
        return preview;
    };
    const handleDragStart = (e, mode) => {
        const properties = editorEngine.insert.getDefaultProperties(mode);
        e.dataTransfer.setData('text/plain', mode);
        e.dataTransfer.setData('application/json', JSON.stringify(properties));
        e.dataTransfer.effectAllowed = 'copy';
        editorEngine.mode = mode;
        // Disable pointer-events on webviews during drag
        for (const webview of editorEngine.webviews.webviews.values()) {
            webview.webview.style.pointerEvents = 'none';
        }
        const dragPreview = createDragPreview(properties);
        document.body.appendChild(dragPreview);
        e.dataTransfer.setDragImage(dragPreview, 50, 50);
        setTimeout(() => document.body.removeChild(dragPreview), 0);
    };
    const toolbarItems = TOOLBAR_ITEMS({ t });
    return (<react_1.AnimatePresence mode="wait">
            {editorEngine.mode !== models_1.EditorMode.PREVIEW && (<react_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex flex-col border p-1 px-1.5 bg-background/30 dark:bg-background/85 backdrop-blur rounded-lg drop-shadow-xl" transition={{
                type: 'spring',
                bounce: 0.1,
                duration: 0.4,
                stiffness: 200,
                damping: 25,
            }}>
                    {terminalHidden ? (<react_1.motion.div layout className="flex items-center gap-1">
                            <toggle_group_1.ToggleGroup type="single" value={mode} onValueChange={(value) => {
                    if (value) {
                        editorEngine.mode = value;
                        setMode(value);
                    }
                }}>
                                {toolbarItems.map((item) => (<tooltip_1.Tooltip key={item.mode}>
                                        <tooltip_1.TooltipTrigger asChild>
                                            <div draggable={item.draggable} onDragStart={(e) => handleDragStart(e, item.mode)}>
                                                <toggle_group_1.ToggleGroupItem value={item.mode} aria-label={item.hotkey.description} disabled={item.disabled} className="hover:text-foreground-hover text-foreground-tertiary">
                                                    <item.icon />
                                                </toggle_group_1.ToggleGroupItem>
                                            </div>
                                        </tooltip_1.TooltipTrigger>
                                        <tooltip_1.TooltipContent>
                                            <hotkeys_label_1.HotKeyLabel hotkey={item.hotkey}/>
                                        </tooltip_1.TooltipContent>
                                    </tooltip_1.Tooltip>))}
                            </toggle_group_1.ToggleGroup>
                            <react_1.motion.div layout className="relative -my-1">
                                <RunButton_1.default />
                            </react_1.motion.div>
                            <tooltip_1.Tooltip>
                                <tooltip_1.TooltipTrigger asChild>
                                    <button onClick={() => setTerminalHidden(!terminalHidden)} className="h-9 w-9 flex items-center justify-center hover:text-foreground-hover text-foreground-tertiary hover:bg-accent rounded-md">
                                        <icons_1.Icons.Terminal />
                                    </button>
                                </tooltip_1.TooltipTrigger>
                                <tooltip_1.TooltipContent>Toggle Terminal</tooltip_1.TooltipContent>
                            </tooltip_1.Tooltip>
                        </react_1.motion.div>) : (<react_1.motion.div layout className="flex items-center justify-between w-full mb-1">
                            <react_1.motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.7 }} className="text-small text-foreground-secondary ml-2 select-none">
                                Terminal
                            </react_1.motion.span>
                            <div className="flex items-center gap-1">
                                <react_1.motion.div layout>
                                    <RunButton_1.default />
                                </react_1.motion.div>
                                <tooltip_1.Tooltip>
                                    <tooltip_1.TooltipTrigger asChild>
                                        <button onClick={() => setTerminalHidden(!terminalHidden)} className="h-9 w-9 flex items-center justify-center hover:text-foreground-hover text-foreground-tertiary hover:bg-accent rounded-lg">
                                            <icons_1.Icons.ChevronDown />
                                        </button>
                                    </tooltip_1.TooltipTrigger>
                                    <tooltip_1.TooltipContent>Toggle Terminal</tooltip_1.TooltipContent>
                                </tooltip_1.Tooltip>
                            </div>
                        </react_1.motion.div>)}
                    <Terminal_1.default hidden={terminalHidden}/>
                </react_1.motion.div>)}
        </react_1.AnimatePresence>);
});
//# sourceMappingURL=index.js.map