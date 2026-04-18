"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = exports.stop = exports.start = void 0;
const start = async (sandboxId) => {
    return {
        previewUrl: `http://localhost:8084`,
        editorUrl: `http://localhost:8080`,
    };
};
exports.start = start;
const stop = async (sandboxId) => {
    return {
        previewUrl: `http://localhost:8084`,
        editorUrl: `http://localhost:8080`,
    };
};
exports.stop = stop;
const status = async (sandboxId) => {
    return {
        previewUrl: `http://localhost:8084`,
        editorUrl: `http://localhost:8080`,
    };
};
exports.status = status;
//# sourceMappingURL=index.js.map