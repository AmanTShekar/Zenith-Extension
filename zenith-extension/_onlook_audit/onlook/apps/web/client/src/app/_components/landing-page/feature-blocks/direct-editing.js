"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectEditingBlock = DirectEditingBlock;
const react_1 = __importDefault(require("react"));
const icons_1 = require("@onlook/ui/icons");
const direct_editing_interactive_1 = require("../../shared/mockups/direct-editing-interactive");
function DirectEditingBlock() {
    return (<div className="flex flex-col gap-6">
            <direct_editing_interactive_1.DirectEditingInteractive />
            <div className="flex flex-row items-start gap-8 w-full">
                <div className="flex flex-col items-start w-1/2">
                    <div className="mb-2"><icons_1.Icons.DirectManipulation className="w-6 h-6 text-foreground-primary"/></div>
                    <span className="text-foreground-primary text-largePlus font-light">Canvas Manipulation</span>
                </div>
                <p className="text-foreground-secondary text-regular text-balance w-1/2">Drag, resize, and arrange elements directly on the canvas. See changes in real code instantly.</p>
            </div>
        </div>);
}
//# sourceMappingURL=direct-editing.js.map