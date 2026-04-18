"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementBanner = void 0;
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const Context_1 = require("../Context");
var Variant;
(function (Variant) {
    Variant["INFO"] = "info";
    Variant["WARNING"] = "warning";
    Variant["SUCCESS"] = "success";
})(Variant || (Variant = {}));
exports.AnnouncementBanner = (0, mobx_react_lite_1.observer)(({ variant = Variant.INFO }) => {
    const MESSAGE = 'Onlook is moving to the web';
    const editorEngine = (0, Context_1.useEditorEngine)();
    return (<div className={(0, utils_1.cn)('w-full h-full flex flex-row items-center justify-center transition-colors duration-300 ease-in-out')}>
            <div className="flex flex-row items-center gap-2 text-sm">
                <span className="flex-1">{MESSAGE}</span>
                <span>•</span>
                <button onClick={() => {
            editorEngine.isAnnouncementOpen = true;
        }} className="no-drag underline hover:text-blue-300">
                    Learn more
                </button>
            </div>
        </div>);
});
//# sourceMappingURL=AnnouncementBanner.js.map