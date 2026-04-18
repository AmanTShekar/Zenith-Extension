"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftContextPill = void 0;
const chat_1 = require("@onlook/models/chat");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const react_1 = require("motion/react");
const react_2 = __importDefault(require("react"));
const helpers_1 = require("./helpers");
exports.DraftContextPill = react_2.default.forwardRef(({ context, onRemove }, ref) => {
    const isBranch = context.type === chat_1.MessageContextType.BRANCH;
    return (<react_1.motion.span layout="position" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{
            duration: 0.2,
            layout: {
                duration: 0.15,
                ease: 'easeOut',
            },
        }} className={(0, utils_1.cn)('group relative flex flex-row items-center gap-1 justify-center border border-foreground-tertiary/20 rounded-md h-7 px-2', isBranch ? 'bg-teal-900 border-teal-800 text-teal-200' : 'bg-background-tertiary/50 text-foreground-secondary')} ref={ref}>
            <div className="w-4 flex text-center items-center justify-center">
                <div>{(0, helpers_1.getContextIcon)(context)}</div>
                <button onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
        }} className="absolute -top-1.5 -right-1.5 w-6 h-6 p-1 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                    <icons_1.Icons.CrossL className="w-2.5 h-2.5 text-primary-foreground"/>
                </button>
            </div>
            <span className="text-xs">{(0, helpers_1.getTruncatedName)(context)}</span>
        </react_1.motion.span>);
});
exports.DraftContextPill.displayName = 'DraftContextPill';
//# sourceMappingURL=draft-context-pill.js.map