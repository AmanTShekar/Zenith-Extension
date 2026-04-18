"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const icons_1 = require("@onlook/ui/icons");
const toggle_group_1 = require("@onlook/ui/toggle-group");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const TextInput_1 = __importDefault(require("../single/TextInput"));
const DISPLAY_NAME_OVERRIDE = {
    Top: <icons_1.Icons.BorderTop className="w-4 h-4"/>,
    Bottom: <icons_1.Icons.BorderBottom className="w-4 h-4"/>,
    Right: <icons_1.Icons.BorderRight className="w-4 h-4"/>,
    Left: <icons_1.Icons.BorderLeft className="w-4 h-4"/>,
    'Top Right': <icons_1.Icons.CornerTopRight className="w-4 h-4"/>,
    'Top Left': <icons_1.Icons.CornerTopLeft className="w-4 h-4"/>,
    'Bottom Right': <icons_1.Icons.CornerBottomRight className="w-4 h-4"/>,
    'Bottom Left': <icons_1.Icons.CornerBottomLeft className="w-4 h-4"/>,
};
const NestedInputs = (0, mobx_react_lite_1.observer)(({ compoundStyle }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [showGroup, setShowGroup] = (0, react_2.useState)(false);
    (0, react_2.useEffect)(() => {
        const selectedStyle = editorEngine.style.selectedStyle;
        if (!selectedStyle) {
            return;
        }
        setShowGroup(compoundStyle.isHeadSameAsChildren(selectedStyle.styles));
        getOriginalChildrenValues();
    }, [editorEngine.style.selectedStyle]);
    const getOriginalChildrenValues = () => {
        const selectedStyle = editorEngine.style.selectedStyle;
        if (!selectedStyle) {
            return;
        }
    };
    const onTopValueChanged = (key, value) => {
        overrideChildrenStyles(value);
    };
    const handleToggleGroupChange = (value) => {
        setShowGroup(value === 'true');
        if (value === 'false') {
            const styleRecord = editorEngine.style.selectedStyle;
            if (!styleRecord) {
                return;
            }
            const topValue = compoundStyle.head.getValue(styleRecord.styles);
            const topValueSplit = topValue.split(' ')[0] || '';
            editorEngine.style.update(compoundStyle.head.key, topValueSplit);
            overrideChildrenStyles(topValueSplit);
        }
    };
    const overrideChildrenStyles = (newValue) => {
        editorEngine.style.updateStyleNoAction(Object.fromEntries(compoundStyle.children.map((elementStyle) => [elementStyle.key, newValue])));
    };
    function renderTopInput() {
        const elementStyle = compoundStyle.head;
        return (<div key={`${elementStyle.key}`} className="flex flex-row items-center col-span-2">
                <p className="text-xs text-left text-foreground-onlook">
                    {elementStyle.displayName}
                </p>
                <div className="ml-auto h-8 flex flex-row w-32 space-x-1">
                    <TextInput_1.default elementStyle={elementStyle} onValueChange={onTopValueChanged}/>
                    <toggle_group_1.ToggleGroup size="sm" type="single" value={showGroup ? 'true' : 'false'} onValueChange={handleToggleGroupChange}>
                        <toggle_group_1.ToggleGroupItem value="false" className="data-[state=on]:bg-background-onlook/75 data-[state=on]:text-foreground-onlook">
                            <icons_1.Icons.BorderAll className="w-4 h-5"/>
                        </toggle_group_1.ToggleGroupItem>
                        <toggle_group_1.ToggleGroupItem value="true" className="data-[state=on]:bg-background-onlook/75 data-[state=on]:text-foreground-onlook">
                            <icons_1.Icons.Corners className="w-4 h-5"/>
                        </toggle_group_1.ToggleGroupItem>
                    </toggle_group_1.ToggleGroup>
                </div>
            </div>);
    }
    function renderBottomInputs() {
        return (<react_1.AnimatePresence>
                {showGroup && (<react_1.motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid grid-cols-2 col-span-2 gap-2">
                        {compoundStyle.children.map((elementStyle) => (<div key={elementStyle.key} className="flex flex-row items-center">
                                <div className="w-12 text-foreground-onlook">
                                    {DISPLAY_NAME_OVERRIDE[elementStyle.displayName] ||
                        elementStyle.displayName}
                                </div>
                                <TextInput_1.default elementStyle={elementStyle}/>
                            </div>))}
                    </react_1.motion.div>)}
            </react_1.AnimatePresence>);
    }
    return (<div className="grid grid-cols-2 gap-2 my-2">
            {renderTopInput()}
            {renderBottomInputs()}
        </div>);
});
exports.default = NestedInputs;
//# sourceMappingURL=NestedInputs.js.map