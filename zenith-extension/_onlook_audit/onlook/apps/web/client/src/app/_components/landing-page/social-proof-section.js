"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialProofSection = SocialProofSection;
const react_1 = __importDefault(require("react"));
const github_1 = require("../top-bar/github");
function SocialProofSection() {
    const { formatted: starCount, contributors } = (0, github_1.useGitHubStats)();
    return (<div className="w-full max-w-6xl mx-auto py-16 px-8">
            <div className="text-center">
                <h2 className="text-foreground-primary text-2xl font-light mb-8">Community Stats:</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-2xl font-light text-foreground-primary mb-2">{starCount}+</div>
                        <div className="text-foreground-secondary text-regular">GitHub stars</div>
                    </div>
                    <div>
                        <div className="text-2xl font-light text-foreground-primary mb-2">{contributors}+</div>
                        <div className="text-foreground-secondary text-regular">contributors</div>
                    </div>
                    <div>
                        <div className="text-2xl font-light text-foreground-primary mb-2">YC W25</div>
                        <div className="text-foreground-secondary text-regular">backed</div>
                    </div>
                    <div>
                        <div className="text-2xl font-light text-foreground-primary mb-2">Open source</div>
                        <div className="text-foreground-secondary text-regular">&amp; transparent</div>
                    </div>
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=social-proof-section.js.map