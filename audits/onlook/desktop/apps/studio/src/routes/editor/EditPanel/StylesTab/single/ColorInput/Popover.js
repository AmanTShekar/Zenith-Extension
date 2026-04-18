"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopoverPicker = void 0;
const Context_1 = require("@/components/Context");
const popover_1 = require("@onlook/ui/popover");
const tabs_1 = require("@onlook/ui/tabs");
const react_1 = require("react");
const _1 = require(".");
const ColorButton_1 = __importDefault(require("./ColorButton"));
const ColorPicker_1 = __importDefault(require("./ColorPicker"));
const ImagePicker_1 = __importDefault(require("./ImagePicker"));
var TabValue;
(function (TabValue) {
    TabValue["SOLID"] = "solid";
    TabValue["IMAGE"] = "image";
})(TabValue || (TabValue = {}));
exports.PopoverPicker = (0, react_1.memo)(({ color, onChange, onChangeEnd, backgroundImage, compoundStyle }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [isOpen, toggleOpen] = (0, react_1.useState)(false);
    const defaultValue = backgroundImage && !(0, _1.isBackgroundImageEmpty)(backgroundImage)
        ? TabValue.IMAGE
        : TabValue.SOLID;
    (0, react_1.useEffect)(() => {
        if (isOpen && !editorEngine.history.isInTransaction) {
            editorEngine.history.startTransaction();
            return;
        }
        if (!isOpen && editorEngine.history.isInTransaction) {
            editorEngine.history.commitTransaction();
        }
        return () => editorEngine.history.commitTransaction();
    }, [isOpen]);
    return (<popover_1.Popover onOpenChange={(open) => toggleOpen(open)}>
                <popover_1.PopoverTrigger>
                    <ColorButton_1.default value={color} onClick={() => toggleOpen(!isOpen)} backgroundImage={backgroundImage}/>
                </popover_1.PopoverTrigger>
                <popover_1.PopoverContent align="end" className="backdrop-blur-lg z-10 rounded-lg p-0 shadow-xl overflow-hidden w-56">
                    {backgroundImage ? (<div>
                            <tabs_1.Tabs defaultValue={defaultValue} className="bg-transparent pb-0 mt-2">
                                <tabs_1.TabsList className="bg-transparent px-2 m-0 gap-2">
                                    <tabs_1.TabsTrigger value={TabValue.SOLID} className="bg-transparent text-xs p-1 hover:text-foreground-primary">
                                        Solid
                                    </tabs_1.TabsTrigger>
                                    <tabs_1.TabsTrigger value={TabValue.IMAGE} className="bg-transparent text-xs p-1 hover:text-foreground-primary">
                                        Image
                                    </tabs_1.TabsTrigger>
                                </tabs_1.TabsList>
                                <tabs_1.TabsContent value="solid" className="p-0 m-0">
                                    <ColorPicker_1.default color={color} onChange={onChange} onChangeEnd={onChangeEnd}/>
                                </tabs_1.TabsContent>
                                <tabs_1.TabsContent value="image" className="p-0 m-0">
                                    <ImagePicker_1.default compoundStyle={compoundStyle} backgroundImage={backgroundImage}/>
                                </tabs_1.TabsContent>
                            </tabs_1.Tabs>
                        </div>) : (<ColorPicker_1.default color={color} onChange={onChange} onChangeEnd={onChangeEnd}/>)}
                </popover_1.PopoverContent>
            </popover_1.Popover>);
});
exports.PopoverPicker.displayName = 'PopoverPicker';
//# sourceMappingURL=Popover.js.map