"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dunes = Dunes;
const dunes_login_dark_png_1 = __importDefault(require("@/assets/dunes-login-dark.png"));
const dunes_login_light_png_1 = __importDefault(require("@/assets/dunes-login-light.png"));
function Dunes() {
    return (<div className="hidden w-full lg:block md:block m-6">
            <img className="w-full h-full object-cover rounded-xl hidden dark:flex" src={dunes_login_dark_png_1.default} alt="Onlook dunes dark"/>
            <img className="w-full h-full object-cover rounded-xl flex dark:hidden" src={dunes_login_light_png_1.default} alt="Onlook dunes light"/>
        </div>);
}
//# sourceMappingURL=dunes.js.map