"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Document;
const script_1 = __importDefault(require("next/script"));
function Document() {
    return (<html>
            <head>
                <title>Test</title>
                <script_1.default type="module" src="https://cdn.jsdelivr.net/gh/onlook-dev/onlook@main/apps/web/client/public/onlook-preload-script.js" strategy="afterInteractive" type="module" id="https://cdn.jsdelivr.net/gh/onlook-dev/onlook@main/apps/web/client/public/onlook-preload-script.js"/>
            </head>
            <body>
                <main />
                <script_1.default type="module" src="https://cdn.jsdelivr.net/gh/onlook-dev/onlook@main/apps/web/client/public/onlook-preload-script.js" strategy="afterInteractive" type="module" id="https://cdn.jsdelivr.net/gh/onlook-dev/onlook@main/apps/web/client/public/onlook-preload-script.js" id="onlook-preload-script" strategy="afterInteractive"/>
            </body>
        </html>);
}
//# sourceMappingURL=input.js.map