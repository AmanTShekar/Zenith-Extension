"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTheme = getTheme;
exports.setTheme = setTheme;
function getTheme() {
    try {
        return window?.localStorage.getItem('theme') || 'light';
    }
    catch (error) {
        console.warn('Failed to get theme', error);
        return 'light';
    }
}
function setTheme(theme) {
    try {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            window?.localStorage.setItem('theme', 'dark');
            return true;
        }
        else {
            document.documentElement.classList.remove('dark');
            window?.localStorage.setItem('theme', 'light');
            return false;
        }
    }
    catch (error) {
        console.warn('Failed to set theme', error);
        return false;
    }
}
//# sourceMappingURL=index.js.map