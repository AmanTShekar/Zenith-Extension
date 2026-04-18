"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const webview_1 = require("@/lib/editor/engine/webview");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const popover_1 = require("@onlook/ui/popover");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const EnabledButton = (0, mobx_react_lite_1.observer)(({ webviewId }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const selected = editorEngine.webviews.isSelected(webviewId);
    const state = editorEngine.webviews.getState(webviewId);
    // Only show button for error states
    if (state !== webview_1.WebviewState.DOM_NO_ONLOOK) {
        return null;
    }
    const button = (<button_1.Button variant="ghost" className="group px-1 text-amber-300 hover:text-amber-100 hover:bg-amber-400/10" size={'icon'}>
            <icons_1.Icons.ExclamationTriangle className={(0, utils_1.cn)('fill-inherit', selected && 'group-hover:text-amber-100')}/>
        </button_1.Button>);
    return (<popover_1.Popover>
            <popover_1.PopoverTrigger asChild>{button}</popover_1.PopoverTrigger>
            <popover_1.PopoverContent>
                <div className="space-y-2 flex flex-col w-80 items-center">
                    <div className="flex gap-2 justify-center">
                        <p className="text-active text-regularPlus">
                            {"Onlook won't work on this page"}
                        </p>
                        <icons_1.Icons.CircleBackslash className="mt-[3px] text-red-500"/>
                    </div>
                    <p className="text-foreground-onlook text-small text-left">
                        {"This url is not linked to Onlook's editor. Please navigate to a url that is linked to Onlook's editor."}
                    </p>
                </div>
            </popover_1.PopoverContent>
        </popover_1.Popover>);
});
exports.default = EnabledButton;
//# sourceMappingURL=EnabledButton.js.map