"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSB_DOMAIN = exports.CSB_PREVIEW_TASK_NAME = exports.SandboxTemplates = exports.Templates = void 0;
exports.getSandboxPreviewUrl = getSandboxPreviewUrl;
var Templates;
(function (Templates) {
    Templates["BLANK"] = "BLANK";
    Templates["EMPTY_NEXTJS"] = "EMPTY_NEXTJS";
})(Templates || (exports.Templates = Templates = {}));
exports.SandboxTemplates = {
    BLANK: {
        id: 'xzsy8c',
        port: 3000,
    },
    EMPTY_NEXTJS: {
        id: 'pt_EphPmsurimGCQdiB44wa7s',
        port: 3000,
    },
};
exports.CSB_PREVIEW_TASK_NAME = 'dev';
exports.CSB_DOMAIN = 'csb.app';
function getSandboxPreviewUrl(sandboxId, port) {
    return `https://${sandboxId}-${port}.${exports.CSB_DOMAIN}`;
}
//# sourceMappingURL=csb.js.map