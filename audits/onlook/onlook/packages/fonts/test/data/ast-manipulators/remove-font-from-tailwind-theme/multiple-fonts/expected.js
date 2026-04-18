"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            fontFamily: {
                inter: ['var(--font-inter)', 'sans-serif'],
                poppins: ['var(--font-poppins)', 'sans-serif']
            }
        }
    },
    plugins: []
};
exports.default = config;
//# sourceMappingURL=expected.js.map