"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/editor/styles/models");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const ColorInput_1 = __importDefault(require("../single/ColorInput"));
const NumberUnitInput_1 = __importDefault(require("../single/NumberUnitInput"));
const SelectInput_1 = __importDefault(require("../single/SelectInput"));
const TextInput_1 = __importDefault(require("../single/TextInput"));
const BorderInput = (0, mobx_react_lite_1.observer)(({ compoundStyle }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const computeShowGroup = (selectedStyle) => {
        if (!selectedStyle) {
            console.error('No style record found');
            return false;
        }
        const colorValue = compoundStyle.head.getValue(selectedStyle.styles);
        return !(0, utility_1.isColorEmpty)(colorValue);
    };
    const [showGroup, setShowGroup] = (0, react_2.useState)(computeShowGroup(editorEngine.style.selectedStyle));
    const onColorValueChange = (key, newColorValue) => {
        const styleRecord = editorEngine.style.selectedStyle;
        if (!styleRecord) {
            console.error('No style record found');
            return;
        }
        const borderWidthStyle = compoundStyle.children.find((elementStyle) => elementStyle.key === 'borderWidth');
        if (!borderWidthStyle) {
            console.error('Border width style not found');
            return;
        }
        const originalBorderWidth = borderWidthStyle.getValue(styleRecord.styles);
        let newBorderWidth = originalBorderWidth;
        const colorIsEmpty = (0, utility_1.isColorEmpty)(newColorValue);
        if (colorIsEmpty) {
            if (newBorderWidth !== '0px') {
                newBorderWidth = '0px';
            }
        }
        else {
            if (newBorderWidth === '0px') {
                newBorderWidth = '1px';
            }
        }
        if (newBorderWidth !== originalBorderWidth) {
            const inTransaction = editorEngine.history.isInTransaction;
            if (inTransaction) {
                editorEngine.history.commitTransaction();
            }
            editorEngine.style.update('borderWidth', newBorderWidth);
            if (inTransaction) {
                editorEngine.history.startTransaction();
            }
        }
        setShowGroup(!colorIsEmpty);
    };
    function renderTopInput() {
        const elementStyle = compoundStyle.head;
        return (<div key={elementStyle.key} className="flex flex-row items-center col-span-2">
                <p className="text-xs text-left text-foreground-onlook">
                    {elementStyle.displayName}
                </p>
                <div className="ml-auto h-8 flex flex-row w-32 space-x-2">
                    <ColorInput_1.default elementStyle={elementStyle} onValueChange={onColorValueChange}/>
                </div>
            </div>);
    }
    function renderBottomInputs() {
        return (<react_1.AnimatePresence>
                {showGroup && (<react_1.motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-2 transition-all duration-300 ease-in-out">
                        {compoundStyle.children.map((elementStyle) => (<div key={elementStyle.key} className="ml-2 flex flex-row items-center">
                                <div className="text-foreground-onlook">
                                    <p className="text-xs text-left">{elementStyle.displayName}</p>
                                </div>
                                <div className="w-32 ml-auto">
                                    {elementStyle.type === models_1.StyleType.Select ? (<SelectInput_1.default elementStyle={elementStyle}/>) : elementStyle.type === models_1.StyleType.Number ? (<NumberUnitInput_1.default elementStyle={elementStyle}/>) : (<TextInput_1.default elementStyle={elementStyle}/>)}
                                </div>
                            </div>))}
                    </react_1.motion.div>)}
            </react_1.AnimatePresence>);
    }
    return (<div className="flex flex-col gap-2 mb-2">
            {renderTopInput()}
            {renderBottomInputs()}
        </div>);
});
exports.default = BorderInput;
//# sourceMappingURL=BorderInput.js.map