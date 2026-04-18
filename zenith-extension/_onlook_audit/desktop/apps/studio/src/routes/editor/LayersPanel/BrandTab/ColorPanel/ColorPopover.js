"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorPopover = void 0;
const constants_1 = require("@onlook/models/constants");
const popover_1 = require("@onlook/ui/popover");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const ColorPicker_1 = __importDefault(require("../../../EditPanel/StylesTab/single/ColorInput/ColorPicker"));
const ColorNameInput_1 = require("./ColorNameInput");
const ColorPopover = ({ color, brandColor, onClose, onColorChange, onColorChangeEnd, isDefaultPalette = false, existedName, }) => {
    const [editedColor, setEditedColor] = (0, react_1.useState)(color);
    const [editedName, setEditedName] = (0, react_1.useState)(brandColor);
    const handleColorChange = (newColor) => {
        setEditedColor(newColor);
    };
    const handleNameChange = (newName) => {
        setEditedName(newName);
        if (onColorChangeEnd) {
            onColorChangeEnd(editedColor, newName);
        }
        if (onClose) {
            onClose();
        }
    };
    (0, react_1.useEffect)(() => {
        setEditedName((0, utility_1.toNormalCase)(brandColor));
    }, [brandColor]);
    return (<popover_1.Popover onOpenChange={(open) => !open && handleNameChange(editedName)} open={true}>
            <popover_1.PopoverTrigger asChild>
                <div className="w-full aspect-square rounded-lg cursor-pointer hover:ring-2 hover:ring-border-primary border border-white/10" style={{ backgroundColor: editedColor.toHex() }}/>
            </popover_1.PopoverTrigger>
            <popover_1.PopoverContent className="p-0 w-56" side="right" align="start">
                <div className="flex flex-col gap-0 p-0">
                    <div className="flex flex-col gap-1 p-2 pb-1">
                        <label className="text-xs text-muted-foreground">Color Name</label>
                        <ColorNameInput_1.ColorNameInput initialName={editedName} onSubmit={handleNameChange} onCancel={() => {
            setEditedName(brandColor);
            if (onClose) {
                onClose();
            }
        }} existingNames={existedName} disabled={isDefaultPalette || brandColor === constants_1.DEFAULT_COLOR_NAME}/>
                    </div>
                    <ColorPicker_1.default color={editedColor} onChange={handleColorChange} onChangeEnd={handleColorChange}/>
                </div>
            </popover_1.PopoverContent>
        </popover_1.Popover>);
};
exports.ColorPopover = ColorPopover;
//# sourceMappingURL=ColorPopover.js.map