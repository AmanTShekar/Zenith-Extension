"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Success;
const icons_1 = require("@onlook/ui/icons");
const message_screen_1 = __importDefault(require("../message-screen"));
function Success() {
    return (<message_screen_1.default title="Subscription Activated!" message="Your subscription to Onlook has been activated. You can now close this page." icon={<icons_1.Icons.CheckCircled className="size-10 text-green-500"/>}/>);
}
//# sourceMappingURL=page.js.map