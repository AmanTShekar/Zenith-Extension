"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fonts_1 = require("@onlook/fonts");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const FontFiles = (0, mobx_react_lite_1.observer)(({ fontFiles, onWeightChange, onStyleChange, onRemoveFont }) => {
    if (fontFiles.length === 0) {
        return null;
    }
    return (<div className="space-y-2 flex-1 max-h-[350px] pb-6 overflow-y-auto">
                {fontFiles.map((font, index) => (<div key={index} className="flex flex-col space-y-2 border border-white/10 rounded-lg p-3 bg-black/10">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-normal">
                                    {(0, utility_1.extractFontParts)(font.file.name).family}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {font.file.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <select className="appearance-none bg-black/20 border border-white/10 rounded-md text-sm p-2 pr-8 text-white cursor-pointer hover:bg-background-hover hover:text-accent-foreground hover:border-border-hover" value={font.weight} onChange={(e) => onWeightChange(index, e.target.value)}>
                                        {fonts_1.VARIANTS.map((variant) => (<option key={variant.value} value={variant.value}>
                                                {variant.name} ({variant.value})
                                            </option>))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <icons_1.Icons.ChevronDown className="h-4 w-4 text-muted-foreground"/>
                                    </div>
                                </div>

                                <button_1.Button variant="ghost" size="icon" className="h-9 w-9 border border-white/10 bg-black/20 rounded-md" onClick={() => onRemoveFont(index)}>
                                    <icons_1.Icons.Trash className="h-4 w-4 text-muted-foreground"/>
                                </button_1.Button>
                            </div>
                        </div>
                    </div>))}
            </div>);
});
exports.default = FontFiles;
//# sourceMappingURL=font-files.js.map