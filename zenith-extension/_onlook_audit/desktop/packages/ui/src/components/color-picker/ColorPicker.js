"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorPicker = void 0;
const react_1 = require("react");
const ColorSlider_1 = require("./ColorSlider");
const SVPicker_1 = require("./SVPicker");
const tailwind_styled_components_1 = __importDefault(require("tailwind-styled-components"));
const tailwind_merge_1 = require("tailwind-merge");
const utility_1 = require("@onlook/utility");
const utility_2 = require("@onlook/utility");
const draftable_input_1 = require("../draftable-input");
const styled_1 = __importDefault(require("@emotion/styled"));
const input_group_1 = require("../input-group");
const EyeDropperButton_1 = __importDefault(require("./EyeDropperButton"));
const Input = (0, tailwind_styled_components_1.default)(draftable_input_1.DraftableInput) `
  outline-0 w-full h-6 bg-background-onlook/70 rounded focus:ring-1 ring-inset ring-foreground-active text-foreground-primary placeholder:text-foreground-disabled text-center
`;
const InputsRow = ({ color, onChangeEnd, onChange, }) => {
    const [mode, setMode] = (0, react_1.useState)('hex');
    const rgbColor = color.rgb;
    const hslColor = color.hsl;
    return (<div className="z-50 grid grid-cols-[48px_1fr_1fr_1fr_46px] gap-1 text-mini">
            <div className="flex items-center justify-center gap-1 min-w-0 ">
                <label className="text-small text-foreground-primary cursor-pointer hover:text-foreground-hover bg-background-secondary border-[0.5px] border-foreground-tertiary/50 hover:bg-background-hover w-full flex rounded justify-center py-[0.5px] select-none" onClick={() => mode === 'hsl'
            ? setMode('hsv')
            : mode === 'hsv'
                ? setMode('rgb')
                : mode === 'rgb'
                    ? setMode('hex')
                    : setMode('hsl')}>
                    {mode.toUpperCase()}
                </label>
            </div>
            {mode === 'hsl' ? (<input_group_1.InputGroup className="grid grid-cols-subgrid col-span-3 gap-[1px]">
                    <Input value={Math.round(hslColor['h'] * 100).toString()} onChangeValue={(valueString) => {
                const value = (0, utility_2.mod)(Number.parseInt(valueString) / 100, 1);
                const newColor = utility_1.Color.hsl({
                    ...hslColor,
                    h: value,
                });
                onChangeEnd?.(newColor);
                onChange?.(newColor);
                return true;
            }}/>
                    <Input value={Math.round(hslColor['s'] * 100).toString()} onChangeValue={(valueString) => {
                const value = (0, utility_2.mod)(Number.parseInt(valueString) / 100, 1);
                const newColor = utility_1.Color.hsl({
                    ...hslColor,
                    s: value,
                });
                onChangeEnd?.(newColor);
                onChange?.(newColor);
                return true;
            }}/>
                    <Input value={Math.round(hslColor['l'] * 100).toString()} onChangeValue={(valueString) => {
                const value = (0, utility_2.mod)(Number.parseInt(valueString) / 100, 1);
                const newColor = utility_1.Color.hsl({
                    ...hslColor,
                    l: value,
                });
                onChangeEnd?.(newColor);
                onChange?.(newColor);
                return true;
            }}/>
                </input_group_1.InputGroup>) : mode === 'hsv' ? (<input_group_1.InputGroup className="grid grid-cols-subgrid col-span-3 gap-[1px]">
                    <Input value={Math.round(color.h * 360).toString()} onChangeValue={(hString) => {
                const h = (0, utility_2.mod)(Number.parseInt(hString) / 360, 1);
                const newColor = new utility_1.Color({ ...color, h });
                onChangeEnd?.(newColor);
                onChange?.(newColor);
                return true;
            }}/>
                    <Input value={Math.round(color['s'] * 100).toString()} onChangeValue={(valueString) => {
                const value = (0, utility_2.mod)(Number.parseInt(valueString) / 100, 1);
                const newColor = new utility_1.Color({ ...color, s: value });
                onChangeEnd?.(newColor);
                onChange?.(newColor);
                return true;
            }}/>
                    <Input value={Math.round(color['v'] * 100).toString()} onChangeValue={(valueString) => {
                const value = (0, utility_2.mod)(Number.parseInt(valueString) / 100, 1);
                const newColor = new utility_1.Color({ ...color, v: value });
                onChangeEnd?.(newColor);
                onChange?.(newColor);
                return true;
            }}/>
                </input_group_1.InputGroup>) : mode === 'rgb' ? (<input_group_1.InputGroup className="grid grid-cols-subgrid col-span-3 gap-[1px]">
                    <Input value={Math.round(rgbColor['r'] * 255).toString()} onChangeValue={(valueString) => {
                const value = (0, utility_2.mod)(Number.parseInt(valueString) / 255, 1);
                const newColor = utility_1.Color.rgb({
                    ...rgbColor,
                    r: value,
                });
                onChangeEnd?.(newColor);
                onChange?.(newColor);
                return true;
            }}/>
                    <Input value={Math.round(rgbColor['g'] * 255).toString()} onChangeValue={(valueString) => {
                const value = (0, utility_2.mod)(Number.parseInt(valueString) / 255, 1);
                const newColor = utility_1.Color.rgb({
                    ...rgbColor,
                    g: value,
                });
                onChangeEnd?.(newColor);
                onChange?.(newColor);
                return true;
            }}/>
                    <Input value={Math.round(rgbColor['b'] * 255).toString()} onChangeValue={(valueString) => {
                const value = (0, utility_2.mod)(Number.parseInt(valueString) / 255, 1);
                const newColor = utility_1.Color.rgb({
                    ...rgbColor,
                    b: value,
                });
                onChangeEnd?.(newColor);
                onChange?.(newColor);
                return true;
            }}/>
                </input_group_1.InputGroup>) : (<input_group_1.InputGroup className="col-span-3">
                    <Input value={color.toHex6()} onChangeValue={(hexString) => {
                const newColor = utility_1.Color.from(hexString);
                onChange?.(newColor);
                onChangeEnd?.(newColor);
                return true;
            }}/>
                </input_group_1.InputGroup>)}
            <div className="relative w-full">
                <Input value={Math.round(color.a * 100).toString()} onChangeValue={(aString) => {
            const a = (0, utility_2.mod)(Number.parseInt(aString.replace('%', '')) / 100, 1);
            const newColor = new utility_1.Color({ ...color, a });
            onChangeEnd?.(newColor);
            onChange?.(newColor);
            return true;
        }} className="pr-3"/>
                <span className="absolute right-[5px] top-1/2 transform -translate-y-1/2 text-foreground-tertiary" style={{ userSelect: 'none' }}>
                    %
                </span>
            </div>
        </div>);
};
const EyeDropperBox = styled_1.default.div `
    position: relative;
    overflow: hidden;
    width: 36px;
    height: 36px;
    border-radius: 25%;
    &::before {
        content: '';

        z-index: -1;

        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }
`;
const ColorPicker = ({ color, onChangeEnd, onChange, onMouseDown, className }) => {
    const [activeHue, setActiveHue] = (0, react_1.useState)(color.h);
    const [localColor, setLocalColor] = (0, react_1.useState)(color);
    (0, react_1.useEffect)(() => {
        if (color.s > 0.01) {
            setActiveHue(color.h);
        }
        setLocalColor(color);
    }, [color]);
    const handleHueChange = (0, react_1.useCallback)((h) => {
        const newHue = (0, utility_2.mod)(h, 1);
        setActiveHue(newHue);
        const newColor = new utility_1.Color({
            ...localColor,
            h: newHue,
        });
        setLocalColor(newColor);
        onChange?.(newColor);
    }, [localColor, onChange]);
    const handleSVChange = (0, react_1.useCallback)((newColor) => {
        const updatedColor = new utility_1.Color({
            h: activeHue,
            s: newColor.s,
            v: newColor.v,
            a: localColor.a,
        });
        setLocalColor(updatedColor);
        onChange?.(updatedColor);
    }, [activeHue, localColor.a, onChange]);
    return (<div className={(0, tailwind_merge_1.twMerge)('w-[224px] flex flex-col gap-1.5 p-2', className)}>
            <SVPicker_1.SVPicker width={208} height={160} handleSize={16} color={new utility_1.Color({ ...localColor, h: activeHue, a: 1 })} onChangeEnd={(newColor) => {
            const updatedColor = new utility_1.Color({
                h: activeHue,
                s: newColor.s,
                v: newColor.v,
                a: localColor.a,
            });
            setLocalColor(updatedColor);
            onChangeEnd?.(updatedColor);
        }} onChange={handleSVChange} onMouseDown={(newColor) => {
            const updatedColor = new utility_1.Color({
                h: activeHue,
                s: newColor.s,
                v: newColor.v,
                a: localColor.a,
            });
            setLocalColor(updatedColor);
            onMouseDown?.(updatedColor);
        }}/>
            <div className="z-50 flex justify-between items-center">
                <EyeDropperBox>
                    <EyeDropperButton_1.default onColorSelect={(newColor) => {
            setActiveHue(newColor.h);
            setLocalColor(newColor);
            onChangeEnd?.(newColor);
        }}/>
                </EyeDropperBox>
                <div className="flex flex-col gap-1">
                    <ColorSlider_1.ColorSlider direction="right" length={165} handleSize={16} railWidth={13} color={new utility_1.Color({ h: activeHue, s: 1, v: 1 }).toHex()} colorStops={[
            '#FF0000',
            '#FFFF00',
            '#00FF00',
            '#00FFFF',
            '#0000FF',
            '#FF00FF',
            '#FF0000',
        ]} value={activeHue} onChangeEnd={(h) => {
            setActiveHue((0, utility_2.mod)(h, 1));
            const newColor = new utility_1.Color({ ...localColor, h: (0, utility_2.mod)(h, 1) });
            setLocalColor(newColor);
            onChangeEnd?.(newColor);
        }} onChange={handleHueChange} onMouseDown={(h) => {
            setActiveHue((0, utility_2.mod)(h, 1));
            setLocalColor(new utility_1.Color({ ...localColor, h: (0, utility_2.mod)(h, 1) }));
            onMouseDown?.(new utility_1.Color({ ...localColor, h: (0, utility_2.mod)(h, 1) }));
        }}/>
                    <ColorSlider_1.ColorSlider direction="right" length={165} handleSize={16} railWidth={13} color={new utility_1.Color({ ...localColor, a: 1 }).toHex()} colorStops={[
            new utility_1.Color({ ...localColor, a: 0 }).toHex(),
            new utility_1.Color({ ...localColor, a: 1 }).toHex(),
        ]} value={localColor.a} onChangeEnd={(a) => {
            setLocalColor(new utility_1.Color({ ...localColor, a }));
            onChangeEnd?.(new utility_1.Color({ ...localColor, a }));
        }} onChange={(a) => {
            setLocalColor(new utility_1.Color({ ...localColor, a }));
            onChange?.(new utility_1.Color({ ...localColor, a }));
        }} onMouseDown={(a) => {
            setLocalColor(new utility_1.Color({ ...localColor, a }));
            onMouseDown?.(new utility_1.Color({ ...localColor, a }));
        }}/>
                </div>
            </div>
            <InputsRow color={color} onChange={onChange} onChangeEnd={onChangeEnd}/>
        </div>);
};
exports.ColorPicker = ColorPicker;
//# sourceMappingURL=ColorPicker.js.map