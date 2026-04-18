"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelButton = void 0;
const constants_1 = require("@/utils/constants");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const link_1 = __importDefault(require("next/link"));
const CancelButton = () => {
    return (<button_1.Button variant="outline" asChild className="rounded-lg cursor-pointer px-3 py-2 !border-gray-200 border-[0.5px]">
            <link_1.default href={constants_1.Routes.HOME}>
                <icons_1.Icons.CrossL className="w-4 h-4"/> Cancel
            </link_1.default>
        </button_1.Button>);
};
exports.CancelButton = CancelButton;
//# sourceMappingURL=cancel-button.js.map