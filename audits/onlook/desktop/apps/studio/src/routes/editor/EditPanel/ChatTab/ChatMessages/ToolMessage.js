"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolMessage = void 0;
const ToolMessage = ({ message }) => {
    return <div>{JSON.stringify(message.content, null, 2)}</div>;
};
exports.ToolMessage = ToolMessage;
//# sourceMappingURL=ToolMessage.js.map