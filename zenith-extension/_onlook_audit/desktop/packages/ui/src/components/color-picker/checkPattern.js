"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPattern = checkPattern;
const react_1 = require("@emotion/react");
function checkPattern(color0, color1, size, offsetX = '0px', offsetY = '0px') {
    return (0, react_1.css) `
        background-color: ${color0};
        background-image:
            linear-gradient(
                45deg,
                ${color1} 25%,
                transparent 25%,
                transparent 75%,
                ${color1} 75%,
                ${color1}
            ),
            linear-gradient(
                45deg,
                ${color1} 25%,
                transparent 25%,
                transparent 75%,
                ${color1} 75%,
                ${color1}
            );
        background-position:
            ${offsetX} ${offsetY},
            calc(${size} / 2 + ${offsetX}) calc(${size} / 2 + ${offsetY});
        background-size: ${size} ${size};
    `;
}
//# sourceMappingURL=checkPattern.js.map