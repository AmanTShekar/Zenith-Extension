"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenefitsSection = BenefitsSection;
const react_1 = __importDefault(require("react"));
const icons_1 = require("@onlook/ui/icons");
const ai_chat_interactive_1 = require("../shared/mockups/ai-chat-interactive");
const direct_editing_interactive_1 = require("../shared/mockups/direct-editing-interactive");
const tailwind_color_editor_1 = require("../shared/mockups/tailwind-color-editor");
function BenefitsSection() {
    return (<div className="w-full max-w-6xl mx-auto py-32 lg:py-64 px-8">
            <div className="space-y-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col order-2 lg:order-1">
                        <h2 className="text-foreground-secondary text-sm font-medium uppercase tracking-wider mb-4">AI That Understands Context</h2>
                        <p className="text-foreground-primary text-2xl md:text-4xl font-light mb-6">AI Constrained to Your Design System</p>
                        <p className="text-foreground-secondary text-regular mb-8 text-balance max-w-xl">
                            Reference images, designs, and docs in chat. AI sees what you see — no more explaining from scratch. Outputs use your real components, colors, and tokens. No drift. No off-brand results.
                        </p>
                        {/* Removed hidden CTA to avoid unused icon JSX in this client file */}
                    </div>
                    <div className="order-1 lg:order-2">
                        <ai_chat_interactive_1.AiChatInteractive />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col order-2 lg:order-1">
                        <h2 className="text-foreground-secondary text-sm font-medium uppercase tracking-wider mb-4">Canvas Manipulation</h2>
                        <p className="text-foreground-primary text-2xl md:text-4xl font-light mb-6">Design on an Infinite Canvas</p>
                        <p className="text-foreground-secondary text-regular mb-8 text-balance max-w-xl">
                            Drag, resize, and arrange elements directly on the canvas. See changes in real code instantly — no switching between tools. Point at what you want. AI knows exactly what you mean.
                        </p>
                        {/* Removed hidden CTA to avoid unused icon JSX in this client file */}
                    </div>
                    <div className="order-1 lg:order-2">
                        <direct_editing_interactive_1.DirectEditingInteractive />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col order-2 lg:order-1">
                        <h2 className="text-foreground-secondary text-sm font-medium uppercase tracking-wider mb-4">Design System Guardrails</h2>
                        <p className="text-foreground-primary text-2xl md:text-4xl font-light mb-6">Your Colors, Fonts, and Tokens</p>
                        <p className="text-foreground-secondary text-regular mb-6 text-balance max-w-xl">
                            AI is constrained to your design system. Pick from your brand colors, use your typography scales, and style with your existing tokens. No drift. No off-brand outputs.
                        </p>
                        <div className="grid grid-cols-2 gap-8 mb-8 text-foreground-secondary text-regular">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <icons_1.Icons.CheckCircled className="w-5 h-5"/>
                                    <span>Auto Layout & Flexbox</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <icons_1.Icons.CheckCircled className="w-5 h-5"/>
                                    <span>Borders</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <icons_1.Icons.CheckCircled className="w-5 h-5"/>
                                    <span>Margins</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <icons_1.Icons.CheckCircled className="w-5 h-5"/>
                                    <span>Image backgrounds</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <icons_1.Icons.CheckCircled className="w-5 h-5"/>
                                    <span>Typography</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <icons_1.Icons.CheckCircled className="w-5 h-5"/>
                                    <span>Padding</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <icons_1.Icons.CheckCircled className="w-5 h-5"/>
                                    <span>Gradients</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <icons_1.Icons.CheckCircled className="w-5 h-5"/>
                                    <span>Corner Radii</span>
                                </div>
                            </div>
                        </div>
                        {/* Removed hidden CTA to avoid unused icon JSX in this client file */}
                    </div>
                    <div className="w-full h-100 rounded-lg order-1 lg:order-2">
                        <tailwind_color_editor_1.TailwindColorEditorMockup />
                    </div>
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=benefits-section.js.map