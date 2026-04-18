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
            </body>
        </html>);
}
//# sourceMappingURL=input.js.map