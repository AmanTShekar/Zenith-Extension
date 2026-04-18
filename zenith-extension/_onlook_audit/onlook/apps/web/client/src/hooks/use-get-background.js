"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGetBackground = void 0;
const next_themes_1 = require("next-themes");
const react_1 = require("react");
const createDark = '/assets/dunes-create-dark.png';
const createLight = '/assets/dunes-create-light.png';
const loginDark = '/assets/dunes-login-dark.png';
const loginLight = '/assets/dunes-login-light.png';
const useGetBackground = (type) => {
    const [backgroundImage, setBackgroundImage] = (0, react_1.useState)(createDark);
    const { theme } = (0, next_themes_1.useTheme)();
    (0, react_1.useEffect)(() => {
        const determineBackgroundImage = () => {
            // Force dark theme for now
            const isDark = true;
            // const isDark = theme === Theme.Dark || (theme === Theme.System && window.matchMedia('(prefers-color-scheme: dark)').matches);
            const images = {
                create: isDark ? createDark : createLight,
                login: isDark ? loginDark : loginLight,
            };
            return images[type];
        };
        setBackgroundImage(determineBackgroundImage());
    }, [theme]);
    return backgroundImage;
};
exports.useGetBackground = useGetBackground;
//# sourceMappingURL=use-get-background.js.map