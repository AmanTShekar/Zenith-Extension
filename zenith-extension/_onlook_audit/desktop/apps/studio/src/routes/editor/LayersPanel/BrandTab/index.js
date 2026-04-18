"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const button_1 = require("@onlook/ui/button");
const mobx_react_lite_1 = require("mobx-react-lite");
const ColorPanel_1 = __importDefault(require("./ColorPanel"));
const FontPanel_1 = __importDefault(require("./FontPanel"));
const SystemFont_1 = __importDefault(require("./FontPanel/SystemFont"));
const ColorSquare = ({ color }) => (<div className="w-full aspect-square rounded-lg cursor-pointer hover:ring-2 hover:ring-border-primary border border-white/10" style={{ backgroundColor: color }}/>);
const FontVariant = ({ name, isActive = false }) => (<div className="text-base text-muted-foreground">{name}</div>);
const BrandTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    // Sample colors for the brand palette
    const brandColors = [
        // Primary colors
        '#ff5a6a', // Coral Red
        '#ff7a8a', // Salmon Pink
        '#ff9aa8', // Light Coral
        '#ffb9c3', // Light Pink
        '#ffd8de', // Pale Pink
        '#fff0f2', // Very Light Pink
        // Secondary colors
        '#ff5a6a', // Coral Red
        '#ff7a8a', // Salmon Pink
        '#ff9aa8', // Light Coral
        '#ffb9c3', // Light Pink
        '#ffd8de', // Pale Pink
    ];
    // If color panel is visible, show it instead of the main content
    if (editorEngine.brandTab === models_1.BrandTabValue.COLORS) {
        return <ColorPanel_1.default />;
    }
    // If font panel is visible, show it instead of the main content
    if (editorEngine.brandTab === models_1.BrandTabValue.FONTS) {
        return <FontPanel_1.default />;
    }
    return (<div className="flex flex-col h-[calc(100vh-8.25rem)] text-xs text-active flex-grow w-full p-0">
            {/* Brand Palette Section */}
            <div className="flex flex-col gap-3 px-4 pt-4 pb-6 border-b border-border">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-base font-normal">Brand Colors</span>
                    </div>

                    <div className="grid grid-cols-6 gap-1">
                        {brandColors.map((color, index) => (<ColorSquare key={`brand-color-${index}`} color={color}/>))}
                    </div>
                </div>

                <button_1.Button variant="ghost" className="w-full h-10 text-sm text-muted-foreground hover:text-foreground bg-background-secondary hover:bg-background-secondary/70 rounded-lg border border-white/5" onClick={() => (editorEngine.brandTab = models_1.BrandTabValue.COLORS)}>
                    Manage brand colors
                </button_1.Button>
            </div>

            {/* Site Fonts Section */}
            <div className="flex flex-col gap-1.5 px-4 pt-5 pb-6">
                <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                        <span className="text-base font-normal">Site Fonts</span>
                    </div>
                    <SystemFont_1.default />
                </div>
                <button_1.Button variant="ghost" className="w-full h-10 text-sm text-muted-foreground hover:text-foreground bg-background-secondary hover:bg-background-secondary/70 rounded-lg border border-white/5" onClick={() => (editorEngine.brandTab = models_1.BrandTabValue.FONTS)}>
                    Manage site fonts
                </button_1.Button>
            </div>
        </div>);
});
exports.default = BrandTab;
//# sourceMappingURL=index.js.map