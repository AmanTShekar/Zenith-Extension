"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const hotkeys_label_1 = require("@/components/ui/hotkeys-label");
const constants_1 = require("@onlook/models/constants");
const input_1 = require("@onlook/ui/input");
const popover_1 = require("@onlook/ui/popover");
const tooltip_1 = require("@onlook/ui/tooltip");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const hotkeys_1 = require("/common/hotkeys");
const react_i18next_1 = require("react-i18next");
const ZoomControls = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const scale = editorEngine.canvas.scale;
    const { t } = (0, react_i18next_1.useTranslation)();
    const [inputValue, setInputValue] = (0, react_1.useState)(`${Math.round(scale * 100)}%`);
    const [isDropdownOpen, setIsDropdownOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setInputValue(`${Math.round(scale * 100)}%`);
    }, [editorEngine.canvas.scale]);
    const ZOOM_SENSITIVITY = 0.5;
    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 3;
    const handleZoom = (factor) => {
        const container = document.getElementById(constants_1.EditorAttributes.CANVAS_CONTAINER_ID);
        if (container == null) {
            return;
        }
        const zoomFactor = factor * ZOOM_SENSITIVITY;
        const newScale = scale * (1 + zoomFactor);
        const lintedScale = clampZoom(newScale);
        editorEngine.canvas.scale = lintedScale;
    };
    function clampZoom(scale) {
        return Math.min(Math.max(scale, MIN_ZOOM), MAX_ZOOM);
    }
    const handleZoomToFit = () => {
        const container = document.getElementById(constants_1.EditorAttributes.CANVAS_CONTAINER_ID);
        const content = container?.firstElementChild;
        if (container && content) {
            const contentRect = content.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const scaleX = containerRect.width / contentRect.width;
            const scaleY = containerRect.height / contentRect.height;
            const newScale = Math.min(scaleX, scaleY) * constants_1.DefaultSettings.SCALE;
            editorEngine.canvas.scale = newScale;
            //Position fit
            const newPosition = {
                x: constants_1.DefaultSettings.PAN_POSITION.x,
                y: constants_1.DefaultSettings.PAN_POSITION.y,
            };
            editorEngine.canvas.position = newPosition;
        }
    };
    const handleCustomZoom = (value) => {
        value = value.trim();
        const isZoom = /^[0-9]+%?$/.test(value);
        if (isZoom) {
            const numericValue = parseInt(value.replace('%', ''));
            if (!isNaN(numericValue)) {
                const newScale = numericValue / 100;
                const clampedScale = clampZoom(newScale);
                editorEngine.canvas.scale = clampedScale;
            }
        }
    };
    return (<div className="w-16 h-10 rounded-xl text-small flex flex-col items-center justify-center gap-1.5 text-foreground hover:text-muted-foreground">
            <popover_1.Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <popover_1.PopoverTrigger className="w-full h-full flex items-center justify-center">
                            <span>{Math.round(scale * 100)}%</span>
                        </popover_1.PopoverTrigger>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipPortal>
                        <tooltip_1.TooltipContent side="right">{t('editor.zoom.level')}</tooltip_1.TooltipContent>
                    </tooltip_1.TooltipPortal>
                </tooltip_1.Tooltip>
                <popover_1.PopoverContent className="flex flex-col p-1.5 bg-background/85 backdrop-blur-md w-42 min-w-42 ml-5">
                    <input_1.Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => {
            if (e.key === 'Enter') {
                handleCustomZoom(inputValue);
            }
        }} className={`p-1 h-6 text-left text-smallPlus rounded border mb-1 focus-visible:border-red-500`} autoFocus/>
                    <button onClick={() => handleZoom(1)} className="w-full text-left px-2 py-1.5 rounded hover:bg-accent">
                        <hotkeys_label_1.HotKeyLabel className="w-full justify-between text-mini" hotkey={hotkeys_1.Hotkey.ZOOM_IN}/>
                    </button>
                    <button onClick={() => handleZoom(-1)} className="w-full text-left px-2 py-1.5 rounded hover:bg-accent">
                        <hotkeys_label_1.HotKeyLabel className="w-full justify-between text-mini" hotkey={hotkeys_1.Hotkey.ZOOM_OUT}/>
                    </button>
                    <button onClick={handleZoomToFit} className="w-full text-left px-2 py-1.5 rounded hover:bg-accent">
                        <hotkeys_label_1.HotKeyLabel className="w-full justify-between text-mini" hotkey={hotkeys_1.Hotkey.ZOOM_FIT}/>
                    </button>
                    <button onClick={() => (editorEngine.canvas.scale = 1)} className="w-full text-left px-2 py-1.5 rounded hover:bg-accent">
                        <span className="flex-grow text-mini">{t('editor.zoom.reset')}</span>
                    </button>
                    <button onClick={() => (editorEngine.canvas.scale = 2)} className="w-full text-left px-2 py-1.5 rounded hover:bg-accent">
                        <span className="flex-grow text-mini">{t('editor.zoom.double')}</span>
                    </button>
                </popover_1.PopoverContent>
            </popover_1.Popover>
        </div>);
});
exports.default = ZoomControls;
//# sourceMappingURL=index.js.map