"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.toast = exports.Toaster = void 0;
const next_themes_1 = require("next-themes");
const sonner_1 = require("sonner");
Object.defineProperty(exports, "toast", { enumerable: true, get: function () { return sonner_1.toast; } });
const Toaster = ({ ...props }) => {
    const { theme = 'system' } = (0, next_themes_1.useTheme)();
    return (<sonner_1.Toaster position="bottom-left" theme={theme} className="toaster group" {...props}/>);
};
exports.Toaster = Toaster;
//# sourceMappingURL=sonner.js.map