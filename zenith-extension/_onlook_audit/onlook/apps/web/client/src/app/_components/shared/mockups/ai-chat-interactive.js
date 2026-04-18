"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatInteractive = AiChatInteractive;
const icons_1 = require("@onlook/ui/icons");
const react_1 = __importStar(require("react"));
const chatMessages = [
    { sender: 'user', type: 'text', text: 'Design me an inventory tracker website for my Cafe' },
    { sender: 'ai', type: 'text', text: 'Absolutely! Let\'s start by getting the general layout in place with a top navigation bar and a main content area.' },
    { sender: 'ai', type: 'tool', tool: 'Generate code', toolName: 'generateCode', args: { style: 'modern', color: 'blue' } },
];
const PRESET_SENTENCE = "Add a section for baristas to upsell new seasonal flavors";
function UserMessage({ text }) {
    return (<div className="relative group w-full flex flex-row justify-end px-2">
      <div className="w-[80%] flex flex-col ml-8 p-2 rounded-lg shadow-sm rounded-br-none border-[0.5px] bg-background-secondary text-foreground-secondary relative">
        <div className="text-small">{text ?? ''}</div>
      </div>
    </div>);
}
function AiMessage({ text }) {
    return (<div className="relative group w-full flex flex-row justify-start px-2">
      <div className="w-[90%] flex flex-col mr-8 p-1 rounded-lg shadow-sm rounded-bl-none bg-none text-foreground-primary relative">
        <div className="text-small mt-1">{text ?? ''}</div>
      </div>
    </div>);
}
function ToolCallDisplay({ toolName }) {
    return (<div className="px-2">
      <div className="border rounded-lg bg-background-onlook/20 relative">
        <div className="flex items-center justify-between text-foreground-secondary transition-colors pl-3 py-2">
          <div className="flex items-center gap-2">
            <icons_1.Icons.LoadingSpinner className="h-4 w-4 text-foreground-secondary animate-spin"/>
            <span className="text-small pointer-events-none select-none bg-gradient-to-l from-white/20 via-white/90 to-white/20 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer filter drop-shadow-[0_0_14px_rgba(255,255,255,1)]">
              Website.tsx
            </span>
          </div>
          <icons_1.Icons.ChevronDown className="h-4 w-4 text-foreground-tertiary mr-2"/>
        </div>
      </div>
    </div>);
}
function AiChatInteractive() {
    const [displayedText, setDisplayedText] = (0, react_1.useState)('');
    const [currentIndex, setCurrentIndex] = (0, react_1.useState)(0);
    const handleInputChange = (e) => {
        const input = e.target.value;
        if (input.length > displayedText.length) {
            const newIndex = Math.min(currentIndex + 1, PRESET_SENTENCE.length);
            setCurrentIndex(newIndex);
            setDisplayedText(PRESET_SENTENCE.slice(0, newIndex));
        }
        else if (input.length < displayedText.length) {
            const newIndex = Math.max(currentIndex - 1, 0);
            setCurrentIndex(newIndex);
            setDisplayedText(PRESET_SENTENCE.slice(0, newIndex));
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setCurrentIndex(0);
            setDisplayedText('');
            return;
        }
        if (e.key === 'Backspace' && (e.metaKey || e.altKey)) {
            e.preventDefault();
            if (e.metaKey) {
                setCurrentIndex(0);
                setDisplayedText('');
            }
            else if (e.altKey) {
                const words = PRESET_SENTENCE.slice(0, currentIndex).split(' ');
                if (words.length > 1) {
                    words.pop();
                    const newText = words.join(' ');
                    const newIndex = newText.length;
                    setCurrentIndex(newIndex);
                    setDisplayedText(newText);
                }
                else {
                    setCurrentIndex(0);
                    setDisplayedText('');
                }
            }
            return;
        }
        if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key.length === 1) {
            e.preventDefault();
            if (currentIndex < PRESET_SENTENCE.length) {
                const newIndex = currentIndex + 1;
                setCurrentIndex(newIndex);
                setDisplayedText(PRESET_SENTENCE.slice(0, newIndex));
            }
        }
    };
    return (<div className="w-full h-100 bg-background-onlook/80 rounded-lg relative overflow-hidden">
      <div className="w-80 bottom-8 left-1/2 -translate-x-1/2 absolute bg-black/85 border border-foreground-primary/20 rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="py-2 space-y-2 pt-24">
          {chatMessages.map((msg, idx) => {
            if (msg.type === 'text' && msg.sender === 'user') {
                return <UserMessage key={idx} text={msg.text ?? ''}/>;
            }
            if (msg.type === 'text' && msg.sender === 'ai') {
                return <AiMessage key={idx} text={msg.text ?? ''}/>;
            }
            if (msg.type === 'tool') {
                return (<ToolCallDisplay key={idx} toolName={msg.toolName ?? ''}/>);
            }
            return null;
        })}
        </div>
        <div className="border-t border-foreground-primary/10 px-2.5 py-2 flex flex-col items-start gap-1">
          <textarea value={displayedText} onChange={handleInputChange} onKeyDown={handleKeyDown} className="flex-1 text-foreground-primary placeholder-foreground-tertiary text-regular px-0.5 pt-2 h-20 mb-5 w-full resize-none rounded-lg outline-none bg-transparent" placeholder="Type a message..." rows={3} maxLength={PRESET_SENTENCE.length}/>
          <div className="flex flex-row items-center justify-between w-full gap-2">
            <button className="px-1 py-2 rounded-lg flex flex-row items-center gap-2" disabled>
              <icons_1.Icons.Build className="h-4 w-4 text-foreground-tertiary/50"/>
              <p className="text-foreground-secondary/50 text-small">Build</p>
            </button>
            <div className="flex flex-row gap-1">
              <button className="px-2 py-2 rounded-lg bg-background-secondary/0 hover:bg-background-secondary group cursor-copy" disabled>
                <icons_1.Icons.Image className="h-4 w-4 text-foreground-tertiary/50 group-hover:text-foreground-primary"/>
              </button>
              <button className={`px-2 py-2 rounded-full cursor-pointer ${currentIndex === PRESET_SENTENCE.length ? 'bg-foreground-primary' : 'bg-foreground-onlook'}`} disabled>
                <icons_1.Icons.ArrowRight className="h-4 w-4 text-background-secondary"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=ai-chat-interactive.js.map