"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const FontFamily_1 = require("./FontFamily");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const constants_1 = require("@onlook/models/constants");
const SystemFont = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const fontManager = editorEngine.font;
    (0, react_1.useEffect)(() => {
        fontManager.scanFonts();
        fontManager.getDefaultFont();
    }, []);
    return (<div className="flex flex-col divide-y divide-border">
            {!fontManager.fonts.length ? (<div className="flex justify-center items-center border-dashed border-default border-2 rounded-lg h-20 my-2">
                    <span className="text-sm text-muted-foreground">No fonts added</span>
                </div>) : (fontManager.fonts.map((font, index) => (<div key={`system-${font.family}-${index}`}>
                        <div className="flex justify-between items-center">
                            <FontFamily_1.FontFamily name={font.family} variants={font.weight?.map((weight) => constants_1.FONT_VARIANTS.find((v) => v.value === weight)?.name)} showDropdown={true} showAddButton={false} isDefault={font.id === fontManager.defaultFont} onRemoveFont={() => fontManager.removeFont(font)} onSetFont={() => fontManager.setDefaultFont(font)}/>
                        </div>
                    </div>)))}
        </div>);
});
exports.default = SystemFont;
//# sourceMappingURL=SystemFont.js.map