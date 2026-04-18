"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeGroup = ThemeGroup;
const assets_1 = require("@onlook/models/assets");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const react_1 = require("react");
const hover_tooltip_1 = require("../hover-tooltip");
const toolbar_button_1 = require("../toolbar-button");
function ThemeGroup({ frameData }) {
    const [theme, setTheme] = (0, react_1.useState)(assets_1.SystemTheme.SYSTEM);
    (0, react_1.useEffect)(() => {
        const getTheme = async () => {
            if (!frameData?.view) {
                console.error('No frame view found');
                return;
            }
            const theme = await frameData.view.getTheme();
            setTheme(theme);
        };
        void getTheme();
    }, [frameData]);
    async function changeTheme(newTheme) {
        const previousTheme = theme;
        setTheme(newTheme);
        const success = await frameData.view?.setTheme(newTheme);
        if (!success) {
            sonner_1.toast.error('Failed to change theme');
            setTheme(previousTheme);
        }
    }
    return (<>
            <hover_tooltip_1.HoverOnlyTooltip content="System Theme" side="bottom" sideOffset={10}>
                    <toolbar_button_1.ToolbarButton className={`w-9 ${theme === assets_1.SystemTheme.SYSTEM ? 'bg-background-tertiary/50 hover:bg-background-tertiary/50 text-foreground-primary' : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`} onClick={() => changeTheme(assets_1.SystemTheme.SYSTEM)}>
                        <icons_1.Icons.Laptop className="h-4 w-4"/>
                    </toolbar_button_1.ToolbarButton>
            </hover_tooltip_1.HoverOnlyTooltip>
            <hover_tooltip_1.HoverOnlyTooltip content="Dark Theme" side="bottom" sideOffset={10}>
                    <toolbar_button_1.ToolbarButton className={`w-9 ${theme === assets_1.SystemTheme.DARK ? 'bg-background-tertiary/50 hover:bg-background-tertiary/50 text-foreground-primary' : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`} onClick={() => changeTheme(assets_1.SystemTheme.DARK)}>
                        <icons_1.Icons.Moon className="h-4 w-4"/>
                    </toolbar_button_1.ToolbarButton>
            </hover_tooltip_1.HoverOnlyTooltip>
            <hover_tooltip_1.HoverOnlyTooltip content="Light Theme" side="bottom" sideOffset={10}>
                    <toolbar_button_1.ToolbarButton className={`w-9 ${theme === assets_1.SystemTheme.LIGHT ? 'bg-background-tertiary/50 hover:bg-background-tertiary/50 text-foreground-primary' : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`} onClick={() => changeTheme(assets_1.SystemTheme.LIGHT)}>
                        <icons_1.Icons.Sun className="h-4 w-4"/>
                    </toolbar_button_1.ToolbarButton>
            </hover_tooltip_1.HoverOnlyTooltip>
        </>);
}
//# sourceMappingURL=theme-group.js.map