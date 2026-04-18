"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthButton = void 0;
const avatar_dropdown_1 = require("@/components/ui/avatar-dropdown");
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const button_1 = require("@onlook/ui/button");
const link_1 = __importDefault(require("next/link"));
const AuthButton = () => {
    const { data: user } = react_1.api.user.get.useQuery();
    return (<div className="flex items-center gap-3 mt-0">
            {user ? (<>
                    <button_1.Button variant="secondary" asChild className="rounded cursor-pointer">
                        <link_1.default href={constants_1.Routes.PROJECTS}>Projects</link_1.default>
                    </button_1.Button>
                    <avatar_dropdown_1.CurrentUserAvatar className="cursor-pointer hover:opacity-80"/>
                </>) : (<button_1.Button variant="secondary" asChild className="rounded cursor-pointer">
                    <link_1.default href={constants_1.Routes.LOGIN}>Sign In</link_1.default>
                </button_1.Button>)}
        </div>);
};
exports.AuthButton = AuthButton;
//# sourceMappingURL=user.js.map