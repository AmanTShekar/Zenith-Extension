"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/editor/styles/models");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const NumberUnitInput_1 = __importDefault(require("../single/NumberUnitInput"));
const SelectInput_1 = __importDefault(require("../single/SelectInput"));
const TextInput_1 = __importDefault(require("../single/TextInput"));
const GridRowColInput_1 = __importDefault(require("./GridRowColInput"));
var DisplayType;
(function (DisplayType) {
    DisplayType["flex"] = "flex";
    DisplayType["grid"] = "grid";
    DisplayType["block"] = "block";
})(DisplayType || (DisplayType = {}));
const DisplayTypeMap = {
    [DisplayType.block]: [],
    [DisplayType.flex]: ['flexDirection', 'justifyContent', 'alignItems', 'gap'],
    [DisplayType.grid]: ['gridTemplateColumns', 'gridTemplateRows', 'gap'],
};
const RowColKeys = ['gridTemplateColumns', 'gridTemplateRows'];
const DisplayInput = (0, mobx_react_lite_1.observer)(({ compoundStyle }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [displayType, setDisplayType] = (0, react_2.useState)(DisplayType.block);
    (0, react_2.useEffect)(() => {
        const selectedStyle = editorEngine.style.selectedStyle;
        if (!selectedStyle) {
            setDisplayType(compoundStyle.head.defaultValue);
            return;
        }
        const topValue = compoundStyle.head.getValue(selectedStyle.styles);
        setDisplayType(topValue);
    }, [editorEngine.style.selectedStyle]);
    const onDisplayTypeChange = (key, value) => {
        setDisplayType(value);
    };
    function renderTopInput() {
        const elementStyle = compoundStyle.head;
        return (<div key={elementStyle.displayName} className="flex flex-row items-center col-span-2">
                <p className="text-xs text-left text-foreground-onlook">
                    {elementStyle.displayName}
                </p>
                <div className="ml-auto h-8 flex flex-row w-32 space-x-2">
                    <SelectInput_1.default elementStyle={elementStyle} onValueChange={onDisplayTypeChange}/>
                </div>
            </div>);
    }
    function getFlexDirection() {
        const selectedStyle = editorEngine.style.selectedStyle;
        if (!selectedStyle) {
            return 'row';
        }
        return selectedStyle.styles['flexDirection'] ?? 'row';
    }
    function getLabelValue(elementStyle) {
        if (elementStyle.key === 'justifyContent' ||
            (elementStyle.key === 'alignItems' && displayType === DisplayType.flex)) {
            const flexDirection = getFlexDirection();
            if (elementStyle.key === 'justifyContent') {
                return flexDirection === 'row' ? 'Horizontal' : 'Vertical';
            }
            else {
                return flexDirection === 'row' ? 'Vertical' : 'Horizontal';
            }
        }
        return elementStyle.displayName;
    }
    function renderBottomInputs() {
        return compoundStyle.children.map((elementStyle) => (DisplayTypeMap[displayType] || []).includes(elementStyle.key) && (<react_1.motion.div key={elementStyle.key} className="ml-2 flex flex-row items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="text-foreground-onlook">
                            <p className="text-xs text-left">{getLabelValue(elementStyle)}</p>
                        </div>
                        <div className="w-32 ml-auto">
                            {RowColKeys.includes(elementStyle.key) ? (<GridRowColInput_1.default elementStyle={elementStyle}/>) : elementStyle.type === models_1.StyleType.Select ? (<SelectInput_1.default elementStyle={elementStyle}/>) : elementStyle.type === models_1.StyleType.Number ? (<NumberUnitInput_1.default elementStyle={elementStyle}/>) : (<TextInput_1.default elementStyle={elementStyle}/>)}
                        </div>
                    </react_1.motion.div>));
    }
    return (<div className="flex flex-col gap-2 mb-2">
            <react_1.AnimatePresence>
                {renderTopInput()}
                {renderBottomInputs()}
            </react_1.AnimatePresence>
        </div>);
});
exports.default = DisplayInput;
//# sourceMappingURL=DisplayInput.js.map