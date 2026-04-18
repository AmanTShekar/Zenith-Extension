"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTheme = getTheme;
exports.setTheme = setTheme;
const models_1 = require("@onlook/models");
function getTheme() {
    try {
        return window?.localStorage.getItem('theme') || models_1.SystemTheme.LIGHT;
    }
    catch (error) {
        console.warn('Failed to get theme', error);
        return models_1.SystemTheme.LIGHT;
    }
}
function setTheme(theme) {
    try {
        if (theme === models_1.SystemTheme.DARK) {
            document.documentElement.classList.add('dark');
            window?.localStorage.setItem('theme', models_1.SystemTheme.DARK);
        }
        else if (theme === models_1.SystemTheme.LIGHT) {
            document.documentElement.classList.remove('dark');
            window?.localStorage.setItem('theme', models_1.SystemTheme.LIGHT);
        }
        else if (theme === models_1.SystemTheme.SYSTEM) {
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            }
            else {
                document.documentElement.classList.remove('dark');
            }
            window?.localStorage.setItem('theme', models_1.SystemTheme.SYSTEM);
        }
        return true;
    }
    catch (error) {
        console.warn('Failed to set theme', error);
        return false;
    }
}
//# sourceMappingURL=index.js.map