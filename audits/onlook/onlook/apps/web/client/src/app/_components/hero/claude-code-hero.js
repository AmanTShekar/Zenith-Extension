"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeCodeHero = ClaudeCodeHero;
const react_1 = require("motion/react");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const constants_1 = require("@/utils/constants");
const github_1 = require("../top-bar/github");
const unicorn_background_1 = require("./unicorn-background");
function ClaudeCodeHero() {
    const { formatted: starCount } = (0, github_1.useGitHubStats)();
    return (<div className="relative flex h-full w-full flex-col items-center justify-center gap-12 p-8 text-center text-lg">
            <unicorn_background_1.UnicornBackground />
            <div className="relative z-20 flex max-w-3xl flex-col items-center gap-6 pt-4 pb-2">
                <react_1.motion.h1 className="text-foreground-secondary mb-4 text-sm font-medium tracking-wider uppercase" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                    Workflows
                </react_1.motion.h1>
                <react_1.motion.p className="text-center text-4xl !leading-[1.1] leading-tight font-light text-balance md:text-6xl" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                    Claude Code for Designers
                </react_1.motion.p>
                <react_1.motion.h2 className="text-foreground-secondary mx-auto max-w-xl text-center text-lg text-balance" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                    The visual canvas your AI workflow is missing. Claude Code builds it. Onlook lets you design it.
                </react_1.motion.h2>
                <react_1.motion.div className="mt-8 flex flex-row gap-4" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                    <button_1.Button asChild size="lg" className="bg-foreground-primary text-background-primary hover:bg-foreground-hover cursor-pointer p-6 transition-all duration-300">
                        <a href={constants_1.ExternalRoutes.BOOK_DEMO} target="_blank" rel="noopener noreferrer">
                            Book a Demo
                            <icons_1.Icons.ArrowRight className="ml-2 h-4 w-4"/>
                        </a>
                    </button_1.Button>
                </react_1.motion.div>
                <react_1.motion.div className="text-foreground-secondary mt-8 flex items-center justify-center gap-6 text-sm" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                    <div className="flex items-center gap-2">
                        <span>{starCount}+ GitHub stars</span>
                    </div>
                    <div className="bg-foreground-secondary h-1 w-1 rounded-full"></div>
                    <div className="flex items-center gap-2">
                        <span>YC W25</span>
                    </div>
                    <div className="bg-foreground-secondary h-1 w-1 rounded-full"></div>
                    <div className="flex items-center gap-2">
                        <span>Open Source</span>
                    </div>
                </react_1.motion.div>
            </div>
        </div>);
}
//# sourceMappingURL=claude-code-hero.js.map