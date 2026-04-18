"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@fontsource-variable/inter");
const toaster_1 = require("@onlook/ui/toaster");
const tooltip_1 = require("@onlook/ui/tooltip");
const react_i18next_1 = require("react-i18next");
const AppBar_1 = require("./components/AppBar");
const Modals_1 = require("./components/Modals");
const ThemeProvider_1 = require("./components/ThemeProvider");
const i18n_1 = __importDefault(require("./i18n"));
const routes_1 = require("./routes");
function App() {
    return (<react_i18next_1.I18nextProvider i18n={i18n_1.default}>
            <ThemeProvider_1.ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <tooltip_1.TooltipProvider>
                    <AppBar_1.AppBar />
                    <routes_1.Routes />
                    <Modals_1.Modals />
                    <toaster_1.Toaster />
                </tooltip_1.TooltipProvider>
            </ThemeProvider_1.ThemeProvider>
        </react_i18next_1.I18nextProvider>);
}
exports.default = App;
//# sourceMappingURL=App.js.map