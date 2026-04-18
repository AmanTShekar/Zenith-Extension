"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamMessage = void 0;
const Context_1 = require("@/components/Context");
const index_1 = require("@onlook/ui/icons/index");
const mobx_react_lite_1 = require("mobx-react-lite");
const MessageContent_1 = require("./MessageContent");
exports.StreamMessage = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const content = editorEngine.chat.stream.content;
    const messageId = editorEngine.chat.stream.id;
    return (<>
            {editorEngine.chat.isWaiting && (<div className="flex w-full h-full flex-row items-center gap-2 px-4 my-2 text-small content-start text-foreground-secondary">
                    <index_1.Icons.Shadow className="animate-spin"/>
                    <p>Thinking ...</p>
                </div>)}
            {content.length > 0 && (<div className="px-4 py-2 text-small content-start">
                    <div className="flex flex-col text-wrap gap-2">
                        <MessageContent_1.MessageContent messageId={messageId} content={content} applied={false} isStream={true}/>
                    </div>
                </div>)}
        </>);
});
//# sourceMappingURL=StreamMessage.js.map