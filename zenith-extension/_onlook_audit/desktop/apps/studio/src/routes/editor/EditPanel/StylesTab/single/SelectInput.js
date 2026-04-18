"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const icons_1 = require("@onlook/ui/icons");
const toggle_group_1 = require("@onlook/ui/toggle-group");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = __importStar(require("react"));
const OVERRIDE_OPTIONS = {
    'flex-start': 'start',
    'flex-end': 'end',
    'space-between': 'stretch',
    'space-around': 'around',
    'space-evenly': 'evenly',
    'flex-start flex-end': 'between',
    'flex-start flex-start': 'around',
    'flex-end flex-end': 'evenly',
};
const OVERRIDE_ICONS = {
    'flex-start': <icons_1.Icons.ArrowRight />,
    'flex-end': <icons_1.Icons.ArrowDown />,
    'space-between': <icons_1.Icons.ArrowRight />,
    'space-around': <icons_1.Icons.ArrowRight />,
    'space-evenly': <icons_1.Icons.ArrowRight />,
    'flex-start flex-end': <icons_1.Icons.ArrowRight />,
    'flex-start flex-start': <icons_1.Icons.ArrowRight />,
    'flex-end flex-end': <icons_1.Icons.ArrowRight />,
    start: <icons_1.Icons.TextAlignLeft />,
    center: <icons_1.Icons.TextAlignCenter />,
    end: <icons_1.Icons.TextAlignRight />,
    solid: <icons_1.Icons.BorderSolid />,
    dashed: <icons_1.Icons.BorderDashed />,
    dotted: <icons_1.Icons.BorderDotted />,
    row: <icons_1.Icons.ArrowRight />,
    column: <icons_1.Icons.ArrowDown />,
    block: '--',
    justifyContent: {
        'flex-start': <icons_1.Icons.AlignLeft />,
        center: <icons_1.Icons.AlignCenterHorizontally />,
        'flex-end': <icons_1.Icons.AlignRight />,
        'space-between': <icons_1.Icons.SpaceBetweenHorizontally />,
        stretch: <icons_1.Icons.SpaceBetweenHorizontally />,
    },
    alignItems: {
        'flex-start': <icons_1.Icons.AlignTop />,
        center: <icons_1.Icons.AlignCenterVertically />,
        'flex-end': <icons_1.Icons.AlignBottom />,
        'space-between': <icons_1.Icons.SpaceBetweenVertically />,
        stretch: <icons_1.Icons.SpaceBetweenVertically />,
    },
};
const ICON_SELECTION = ['justifyContent', 'alignItems'];
const SelectInput = (0, mobx_react_lite_1.observer)(({ elementStyle, onValueChange, }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [value, setValue] = (0, react_1.useState)(elementStyle.defaultValue);
    (0, react_1.useEffect)(() => {
        if (!editorEngine.style.selectedStyle) {
            return;
        }
        const newValue = elementStyle.getValue(editorEngine.style.selectedStyle?.styles);
        setValue(newValue);
    }, [editorEngine.style.selectedStyle]);
    const handleValueChange = (newValue) => {
        if (!newValue) {
            return;
        }
        setValue(newValue);
        editorEngine.style.update(elementStyle.key, newValue);
        onValueChange && onValueChange(elementStyle.key, newValue);
    };
    const getFlexDirection = () => {
        const selectedStyle = editorEngine.style.selectedStyle;
        if (!selectedStyle) {
            return 'row'; // default to row
        }
        return selectedStyle.styles['flexDirection'] ?? 'row'; // fallback to row if undefined
    };
    const getIcon = (option) => {
        const flexDirection = getFlexDirection();
        if (elementStyle.key === 'justifyContent') {
            return flexDirection === 'row'
                ? OVERRIDE_ICONS.justifyContent[option]
                : OVERRIDE_ICONS.alignItems[option];
        }
        else if (elementStyle.key === 'alignItems') {
            return flexDirection === 'row'
                ? OVERRIDE_ICONS.alignItems[option]
                : OVERRIDE_ICONS.justifyContent[option];
        }
        const icon = OVERRIDE_ICONS[option];
        if (typeof icon === 'object' && !react_1.default.isValidElement(icon)) {
            return null;
        }
        return icon || option;
    };
    if (!elementStyle.params?.options) {
        return null;
    }
    if (elementStyle.params.options.length <= 3 || ICON_SELECTION.includes(elementStyle.key)) {
        return (<toggle_group_1.ToggleGroup className={`w-32 overflow-hidden ${ICON_SELECTION.includes(elementStyle.key) ? 'gap-0.75' : ''}`} size="sm" type="single" value={value} onValueChange={handleValueChange}>
                    {elementStyle.params?.options.map((option) => (<toggle_group_1.ToggleGroupItem className="capitalize text-xs data-[state=on]:bg-background-onlook/75 data-[state=on]:text-foreground-active hover:text-foreground-hover" value={option} key={option}>
                            {getIcon(option)}
                        </toggle_group_1.ToggleGroupItem>))}
                </toggle_group_1.ToggleGroup>);
    }
    return (<div className="relative w-32">
                <select name={elementStyle.displayName} value={value} className="p-[6px] w-full px-2 text-start rounded border-none text-xs text-active bg-background-onlook/75 appearance-none focus:outline-none focus:ring-0 capitalize" onChange={(event) => handleValueChange(event.currentTarget.value)}>
                    {!elementStyle.params.options.includes(value) && (<option value={value}>{value}</option>)}
                    {elementStyle.params.options.map((option) => (<option value={option} key={option}>
                            {OVERRIDE_OPTIONS[option] ?? option}
                        </option>))}
                </select>
                <div className="text-foreground-onlook absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <icons_1.Icons.ChevronDown />
                </div>
            </div>);
});
exports.default = SelectInput;
//# sourceMappingURL=SelectInput.js.map