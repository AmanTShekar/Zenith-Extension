"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const editor_1 = require("@/components/store/editor");
const fonts_1 = require("@onlook/fonts");
const index_1 = require("@onlook/ui/icons/index");
const mobx_react_lite_1 = require("mobx-react-lite");
const font_family_1 = require("./font-family");
const SystemFont = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const fontManager = editorEngine.font;
    return (<div className="flex flex-col divide-y divide-border">
            {fontManager.isScanning ? (<div className="flex justify-center items-center border-dashed border-default border-2 rounded-lg h-20 my-2">
                    <div className="flex items-center gap-2">
                        <index_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin text-muted-foreground"/>
                        <span className="text-sm text-muted-foreground">Scanning fonts...</span>
                    </div>
                </div>) : !fontManager.fonts.length ? (<div className="flex justify-center items-center border-dashed border-default border-2 rounded-lg h-20 my-2">
                    <span className="text-sm text-muted-foreground">No fonts added</span>
                </div>) : (fontManager.fonts.map((font, index) => (<div key={`system-${font.family}-${index}`}>
                        <div className="flex justify-between items-center">
                            <font_family_1.FontFamily name={font.family} variants={font.weight?.map((weight) => fonts_1.VARIANTS.find((v) => v.value === weight)?.name).filter((v) => v !== undefined) ?? []} showDropdown={true} showAddButton={false} isDefault={font.id === fontManager.defaultFont} onRemoveFont={() => fontManager.removeFont(font)} onSetDefault={() => fontManager.setDefaultFont(font)} onClearDefault={() => fontManager.clearDefaultFont()}/>
                        </div>
                    </div>)))}
        </div>);
});
exports.default = SystemFont;
//# sourceMappingURL=system-font.js.map