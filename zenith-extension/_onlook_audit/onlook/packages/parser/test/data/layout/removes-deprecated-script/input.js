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
                <script_1.default type="module" src="https://some-url/onlook-dev/web/script.js"/>
            </head>
            <body>
                <main />
            </body>
        </html>);
}
//# sourceMappingURL=input.js.map