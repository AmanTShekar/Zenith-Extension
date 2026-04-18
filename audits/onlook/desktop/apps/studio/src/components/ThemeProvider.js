"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = void 0;
exports.ThemeProvider = ThemeProvider;
const react_1 = require("react");
const initialState = {
    theme: 'system',
    nextTheme: 'dark',
    setTheme: () => null,
};
const ThemeProviderContext = (0, react_1.createContext)(initialState);
function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'vite-ui-theme', ...props }) {
    const [theme, setTheme] = (0, react_1.useState)(() => localStorage.getItem(storageKey) || defaultTheme);
    const [nextTheme, setNextTheme] = (0, react_1.useState)('dark');
    (0, react_1.useEffect)(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            root.classList.add(systemTheme);
        }
        else {
            root.classList.add(theme);
        }
        const next = (() => {
            switch (theme) {
                case 'dark':
                    return 'light';
                case 'light':
                    return 'system';
                case 'system':
                    return 'dark';
                default:
                    return 'dark';
            }
        })();
        setNextTheme(next);
    }, [theme]);
    const value = {
        theme,
        nextTheme,
        setTheme: (newTheme) => {
            localStorage.setItem(storageKey, newTheme);
            setTheme(newTheme);
        },
    };
    return (<ThemeProviderContext.Provider {...props} value={value}>
            <div className="min-w-screen min-h-screen">{children}</div>
        </ThemeProviderContext.Provider>);
}
const useTheme = () => {
    const context = (0, react_1.useContext)(ThemeProviderContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
exports.useTheme = useTheme;
//# sourceMappingURL=ThemeProvider.js.map