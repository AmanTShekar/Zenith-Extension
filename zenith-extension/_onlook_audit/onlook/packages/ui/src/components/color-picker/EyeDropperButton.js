"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EyeDropperButton = exports.useIsEyeDropperSupported = void 0;
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const use_eye_dropper_1 = __importDefault(require("use-eye-dropper"));
const button_1 = require("../button");
const icons_1 = require("../icons");
const useIsEyeDropperSupported = () => {
    const { isSupported } = (0, use_eye_dropper_1.default)();
    const isSupportedFlag = (0, react_1.useMemo)(() => isSupported(), [isSupported]);
    return isSupportedFlag;
};
exports.useIsEyeDropperSupported = useIsEyeDropperSupported;
const EyeDropperButton = ({ onColorSelect, disabled }) => {
    const { open, isSupported } = (0, use_eye_dropper_1.default)();
    const pickColor = (0, react_1.useCallback)(() => {
        const openPicker = async () => {
            try {
                const result = await open();
                const color = utility_1.Color.from(result.sRGBHex);
                onColorSelect?.(color);
            }
            catch (e) {
                console.error('Error while opening color picker: ', e);
            }
        };
        openPicker();
    }, [open, onColorSelect]);
    return (<button_1.Button variant="ghost" size="icon" disabled={!isSupported() || disabled} onClick={pickColor}>
            <icons_1.Icons.EyeDropper />
        </button_1.Button>);
};
exports.EyeDropperButton = EyeDropperButton;
exports.default = exports.EyeDropperButton;
//# sourceMappingURL=EyeDropperButton.js.map