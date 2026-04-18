"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayChatInput = void 0;
const editor_1 = require("@/components/store/editor");
const keys_1 = require("@/i18n/keys");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const textarea_1 = require("@onlook/ui/textarea");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const next_intl_1 = require("next-intl");
const react_1 = require("react");
const helpers_1 = require("./helpers");
exports.OverlayChatInput = (0, mobx_react_lite_1.observer)(({ inputState, setInputState, }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const t = (0, next_intl_1.useTranslations)();
    const [isComposing, setIsComposing] = (0, react_1.useState)(false);
    const textareaRef = (0, react_1.useRef)(null);
    const handleSubmit = async () => {
        sonner_1.toast.promise(async () => {
            void editorEngine.chat.sendMessage(inputState.value, models_1.ChatType.EDIT);
        }, {
            loading: 'Sending message...',
            success: 'Message sent',
            error: 'Failed to send message',
        });
        setInputState(helpers_1.DEFAULT_INPUT_STATE);
    };
    return (<div className={(0, utils_1.cn)('rounded-xl backdrop-blur-lg transition-all duration-300', 'shadow-xl shadow-background-secondary/50', inputState.isInputting
            ? 'bg-background/80 border shadow-xl shadow-background-secondary/50 p-1'
            : 'bg-background-secondary/85 dark:bg-background/85 border-foreground-secondary/20 hover:border-foreground-secondary/50 p-0.5', 'border flex relative')}>
            {!inputState.isInputting ? (
        // Chat Button
        <button onClick={() => setInputState((prev) => ({ ...prev, isInputting: true }))} className="rounded-lg hover:text-foreground-primary transition-colors px-2.5 py-1.5 flex flex-row items-center gap-2 w-full">
                    <icons_1.Icons.Sparkles className="w-4 h-4"/>
                    <span className="text-mini !font-medium whitespace-nowrap">
                        {t(keys_1.transKeys.editor.panels.edit.tabs.chat.miniChat.button)}
                    </span>
                </button>) : (
        // Input Field
        <div className="flex flex-row items-center gap-1 w-[280px] relative">
                    <button_1.Button size="icon" onClick={() => setInputState((prev) => ({
                ...prev,
                isInputting: false,
                value: '',
            }))} className={(0, utils_1.cn)('group h-6 w-6 absolute left-1 top-1 z-10 border-none shadow-none bg-transparent hover:bg-transparent', 'transition-all duration-200', inputState.value.trim().length >= helpers_1.DIMENSIONS.minCharsToSubmit
                ? 'opacity-0 -translate-x-2 scale-75 pointer-events-none'
                : 'opacity-100 translate-x-0 scale-100 pointer-events-auto')} disabled={inputState.isSubmitting}>
                        <icons_1.Icons.CrossS className="h-4 w-4 text-foreground-secondary group-hover:text-foreground transition-colors"/>
                    </button_1.Button>
                    <textarea_1.Textarea id="chat-input" aria-label="Chat message input" ref={textareaRef} className={(0, utils_1.cn)('w-full !text-xs break-words focus-visible:!ring-0 resize-none shadow-none !border-[0.5px] rounded-lg', 'transition-all duration-150 ease-in-out', 'pr-10 backdrop-blur-lg', inputState.value.trim().length >= helpers_1.DIMENSIONS.minCharsToSubmit
                ? '!pl-2'
                : '!pl-8', '!bg-background-secondary/75 text-foreground-primary !border-background-secondary/75', 'max-h-[80px] caret-[#FA003C]', 'selection:bg-[#FA003C]/30 selection:text-[#FA003C]', '!min-h-0')} value={inputState.value} onChange={(e) => {
                setInputState((prev) => ({ ...prev, value: e.target.value }));
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    const maxHeight = helpers_1.DIMENSIONS.singleLineHeight * 4;
                    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
                    textareaRef.current.scrollTop =
                        textareaRef.current.scrollHeight;
                }
            }} placeholder={t(keys_1.transKeys.editor.panels.edit.tabs.chat.input.placeholder)} style={{
                resize: 'none',
                minHeight: helpers_1.DIMENSIONS.singleLineHeight,
                height: 'auto',
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                lineHeight: '1.5',
            }} rows={1} autoFocus disabled={inputState.isSubmitting} onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                    e.preventDefault();
                    const charCount = inputState.value.trim().length;
                    if (charCount >= helpers_1.DIMENSIONS.minCharsToSubmit) {
                        handleSubmit();
                    }
                }
                else if (e.key === 'Escape') {
                    e.preventDefault();
                    setInputState((prev) => ({
                        ...prev,
                        isInputting: false,
                        value: '',
                    }));
                }
            }} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={(e) => {
                setIsComposing(false);
            }}/>
                    {inputState.value.trim().length >= helpers_1.DIMENSIONS.minCharsToSubmit && (<button_1.Button size="icon" variant="secondary" onClick={handleSubmit} className={(0, utils_1.cn)('absolute right-0.5 bottom-0.5 h-7 w-7', 'bg-foreground-primary text-white hover:bg-foreground-hover')} disabled={inputState.isSubmitting}>
                            <icons_1.Icons.ArrowRight className="h-4 w-4 text-background"/>
                        </button_1.Button>)}
                </div>)}
        </div>);
});
//# sourceMappingURL=chat.js.map