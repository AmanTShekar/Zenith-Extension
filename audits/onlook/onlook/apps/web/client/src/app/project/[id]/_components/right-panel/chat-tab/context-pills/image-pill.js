"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagePill = void 0;
const chat_1 = require("@onlook/models/chat");
const icons_1 = require("@onlook/ui/icons");
const utility_1 = require("@onlook/utility");
const react_1 = require("motion/react");
const react_2 = __importDefault(require("react"));
const helpers_1 = require("./helpers");
exports.ImagePill = react_2.default.forwardRef(({ context, onRemove }, ref) => {
    if (context.type !== chat_1.MessageContextType.IMAGE) {
        console.warn('ImagePill received non-image context');
        return null;
    }
    const isVideo = (0, utility_1.isVideoFile)(context.mimeType);
    return (<react_1.motion.span layout="position" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{
            duration: 0.2,
            layout: {
                duration: 0.15,
                ease: 'easeOut',
            },
        }} className="group relative flex flex-row items-center gap-1 justify-center border bg-background-tertiary rounded-md h-7" key={context.displayName} ref={ref}>
            {/* Left side: Image/Video thumbnail */}
            <div className="w-7 h-7 flex items-center justify-center overflow-hidden relative">
                {isVideo ? (<video src={context.content} className="w-full h-full object-cover rounded-l-md" muted playsInline/>) : (<img src={context.content} alt={context.displayName} className="w-full h-full object-cover rounded-l-md"/>)}
                <div className="absolute inset-0 border-l-[1px] border-y-[1px] rounded-l-md border-white/10 pointer-events-none"/>
            </div>

            {/* Right side: Filename */}
            <span className="text-xs overflow-hidden whitespace-nowrap text-ellipsis max-w-[100px] pr-1">
                {(0, helpers_1.getTruncatedName)(context)}
            </span>

            {/* Hover X button */}
            <button onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
        }} className="absolute -top-1.5 -right-1.5 w-6 h-6 p-1 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <icons_1.Icons.CrossL className="w-2.5 h-2.5 text-primary-foreground"/>
            </button>
        </react_1.motion.span>);
});
exports.ImagePill.displayName = 'ImagePill';
//# sourceMappingURL=image-pill.js.map