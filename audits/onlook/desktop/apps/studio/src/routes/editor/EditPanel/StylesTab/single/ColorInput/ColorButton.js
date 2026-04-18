"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const styled_1 = __importDefault(require("@emotion/styled"));
const color_picker_1 = require("@onlook/ui/color-picker");
const utility_1 = require("@onlook/utility");
const tailwind_merge_1 = require("tailwind-merge");
const ColorButtonBackground = styled_1.default.div `
    ${(0, color_picker_1.checkPattern)('white', '#aaa', '8px')}
`;
const ColorButton = ({ className, value, backgroundImage, ...props }) => {
    const imageStyle = {
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
    return (<div {...props} className={(0, tailwind_merge_1.twMerge)('rounded-sm w-5 h-5 border border-white/20 cursor-pointer shadow bg-background', className)}>
            {(0, utility_1.isColorEmpty)(value?.toHex() ?? 'transparent') ? (<div className="w-full h-full rounded-sm overflow-hidden bg-background-secondary" style={imageStyle}></div>) : (<ColorButtonBackground className="w-full h-full rounded-sm overflow-hidden">
                    <div className="w-full h-full rounded-[1.5px]" style={{
                backgroundColor: value?.toHex() ?? 'transparent',
                ...imageStyle,
            }}/>
                </ColorButtonBackground>)}
        </div>);
};
exports.default = ColorButton;
//# sourceMappingURL=ColorButton.js.map