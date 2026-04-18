"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Layout;
const script_1 = __importDefault(require("next/script"));
const react_1 = __importDefault(require("react"));
function Layout() {
    return (<html>
            <head>
                <script_1.default src="https://example.com/other.js"/>
            </head>
            <body>
                <main />
            
        <script_1.default src="https://cdn.jsdelivr.net/gh/onlook-dev/onlook@d3887f2/apps/web/client/public/onlook-preload-script.js" strategy="afterInteractive" type="module" id="onlook-preload-script"></script_1.default>
      </body>
        </html>);
}
//# sourceMappingURL=expected.js.map