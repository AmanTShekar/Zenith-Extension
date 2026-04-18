"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureFontLoaded = ensureFontLoaded;
const injectedFonts = new Set();
function ensureFontLoaded(raw) {
    if (!raw || typeof document === "undefined")
        return null;
    const fontFamily = raw
        .split(",")[0]
        ?.trim()
        .replace(/^['"]|['"]$/g, "")
        .replace(/^_+|_Fallback_[\da-z]+$|_[\da-z]+$/gi, "")
        .replace(/_/g, " ")
        .trim();
    if (!fontFamily || injectedFonts.has(fontFamily))
        return fontFamily || null;
    const apiName = encodeURIComponent(fontFamily).replace(/%20/g, "+");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${apiName}:wght@400;700&display=swap`;
    document.head.append(link);
    injectedFonts.add(fontFamily);
    return fontFamily;
}
//# sourceMappingURL=use-font-loader.js.map