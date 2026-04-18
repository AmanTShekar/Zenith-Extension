"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotateGroup = RotateGroup;
const react_1 = __importDefault(require("react"));
const icons_1 = require("@onlook/ui/icons");
const hover_tooltip_1 = require("../hover-tooltip");
const toolbar_button_1 = require("../toolbar-button");
function RotateGroup({ frameData }) {
    return (<hover_tooltip_1.HoverOnlyTooltip content="Rotate Device" side="bottom" sideOffset={10}>
            <toolbar_button_1.ToolbarButton className="w-9" onClick={() => {
            const { width, height } = frameData.frame.dimension;
            frameData.frame.dimension.width = height;
            frameData.frame.dimension.height = width;
        }}>
                <icons_1.Icons.Rotate className="h-4 w-4"/>
            </toolbar_button_1.ToolbarButton>
        </hover_tooltip_1.HoverOnlyTooltip>);
}
//# sourceMappingURL=rotate-group.js.map