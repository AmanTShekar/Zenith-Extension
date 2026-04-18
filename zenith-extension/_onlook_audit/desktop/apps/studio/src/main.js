"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("react-dom/client");
const App_1 = __importDefault(require("./App"));
require("@onlook/ui/globals.css");
require("./index.css");
const container = document.getElementById('root');
const root = (0, client_1.createRoot)(container);
root.render(<App_1.default />);
//# sourceMappingURL=main.js.map