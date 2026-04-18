"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatPreviewBlock = AiChatPreviewBlock;
const icons_1 = require("@onlook/ui/icons");
const react_1 = __importDefault(require("react"));
const ai_chat_interactive_1 = require("../../shared/mockups/ai-chat-interactive");
function AiChatPreviewBlock() {
    return (<div className="flex flex-col gap-6 w-full">
      <ai_chat_interactive_1.AiChatInteractive />
      <div className="flex flex-row items-start gap-8 w-full">
        <div className="flex flex-col items-start w-1/2">
          <div className="mb-2"><icons_1.Icons.Sparkles className="w-6 h-6 text-foreground-primary"/></div>
          <span className="text-foreground-primary text-largePlus font-light">AI That Understands Context</span>
        </div>
        <p className="text-foreground-secondary text-regular text-balance w-1/2">Reference images, designs, and docs in chat. AI sees what you see — no more explaining from scratch.</p>
      </div>
    </div>);
}
//# sourceMappingURL=ai-chat-preview-block.js.map