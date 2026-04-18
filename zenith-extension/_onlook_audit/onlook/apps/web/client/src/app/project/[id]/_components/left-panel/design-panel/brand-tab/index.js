"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandTab = void 0;
const editor_1 = require("@/components/store/editor");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const color_panel_1 = __importDefault(require("./color-panel"));
const font_panel_1 = __importDefault(require("./font-panel"));
const system_font_1 = __importDefault(require("./font-panel/system-font"));
const ColorSquare = ({ color }) => (<div className="w-full aspect-square cursor-pointer" style={{ backgroundColor: color }}/>);
exports.BrandTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [brandColors, setBrandColors] = (0, react_1.useState)([]);
    // Get project brand colors
    (0, react_1.useEffect)(() => {
        const loadBrandColors = async () => {
            await editorEngine.theme.scanConfig();
            const { colorGroups, colorDefaults } = editorEngine.theme;
            // Extract color-500 variants from project colors
            const projectColors = [];
            // Add colors from custom color groups (user-defined in Tailwind config)
            Object.values(colorGroups).forEach(group => {
                group.forEach(color => {
                    // Get the default/500 color from each custom color group
                    if (color.name === '500' || color.name === 'default' || color.name === 'DEFAULT') {
                        projectColors.push(color.lightColor);
                    }
                });
            });
            // Add colors from default color groups (standard Tailwind colors)
            Object.values(colorDefaults).forEach(group => {
                group.forEach(color => {
                    // Get the default/500 color from each default color group
                    if (color.name === '500' || color.name === 'default' || color.name === 'DEFAULT') {
                        projectColors.push(color.lightColor);
                    }
                });
            });
            setBrandColors(projectColors);
        };
        loadBrandColors();
    }, [editorEngine.theme]);
    // If color panel is visible, show it instead of the main content
    if (editorEngine.state.brandTab === models_1.BrandTabValue.COLORS) {
        return <color_panel_1.default />;
    }
    // If font panel is visible, show it instead of the main content
    if (editorEngine.state.brandTab === models_1.BrandTabValue.FONTS) {
        return <font_panel_1.default />;
    }
    return (<div className="flex flex-col h-full text-xs text-active flex-grow w-full p-0">
            {/* Brand Palette Section */}
            <div className="flex flex-col gap-3 px-4 pt-4 pb-6 border-b border-border">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm">Brand Colors</span>
                    </div>

                    <div className="grid grid-cols-12 gap-0 rounded-lg overflow-hidden h-[40px] max-h-[40px] bg-background-onlook border-[0.5px] border-white/50 hover:border-[0.5px] hover:border-white cursor-pointer hover:border-transparent transition-all duration-200" onClick={() => (editorEngine.state.brandTab = models_1.BrandTabValue.COLORS)}>
                        {brandColors.length > 0 ? (brandColors.map((color, index) => (<ColorSquare key={`brand-color-${index}`} color={color}/>))) : (Array.from({ length: 12 }, (_, index) => (<div key={`loading-color-${index}`} className="w-full h-full bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 bg-[length:200%_100%] animate-shimmer"/>)))}
                    </div>
                </div>

                <button_1.Button variant="ghost" className="w-full h-10 text-sm text-muted-foreground hover:text-foreground bg-background-secondary hover:bg-background-secondary/70 rounded-lg border border-white/5" onClick={() => (editorEngine.state.brandTab = models_1.BrandTabValue.COLORS)}>
                    Manage brand colors
                </button_1.Button>
            </div>

            {/* Site Fonts Section */}
            <div className="flex flex-col gap-1.5 px-4 pt-5 pb-6">
                <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                        <span className="text-sm">Site Fonts</span>
                    </div>
                    <system_font_1.default />
                </div>
                <button_1.Button variant="ghost" className="w-full h-10 text-sm text-muted-foreground hover:text-foreground bg-background-secondary hover:bg-background-secondary/70 rounded-lg border border-white/5" onClick={() => (editorEngine.state.brandTab = models_1.BrandTabValue.FONTS)}>
                    Manage site fonts
                </button_1.Button>
            </div>
        </div>);
});
//# sourceMappingURL=index.js.map