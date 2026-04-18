"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const ColorInput_1 = __importDefault(require("../single/ColorInput"));
const FillInput = ({ compoundStyle }) => {
    return (<div className="flex flex-row items-center mt-2">
            <p className="text-xs w-24 mr-2 text-start text-foreground-onlook">
                {compoundStyle.key}
            </p>
            <div className="text-end ml-auto">
                <ColorInput_1.default elementStyle={compoundStyle.head} compoundStyle={compoundStyle}/>
            </div>
        </div>);
};
FillInput.displayName = 'FillInput';
exports.default = (0, react_1.memo)(FillInput);
//# sourceMappingURL=FillInput.js.map