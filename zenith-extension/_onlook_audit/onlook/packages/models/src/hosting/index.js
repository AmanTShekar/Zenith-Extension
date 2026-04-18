"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostingProvider = exports.DeploymentStatus = exports.DeploymentType = void 0;
var DeploymentType;
(function (DeploymentType) {
    DeploymentType["PREVIEW"] = "preview";
    DeploymentType["CUSTOM"] = "custom";
    DeploymentType["UNPUBLISH_PREVIEW"] = "unpublish_preview";
    DeploymentType["UNPUBLISH_CUSTOM"] = "unpublish_custom";
})(DeploymentType || (exports.DeploymentType = DeploymentType = {}));
var DeploymentStatus;
(function (DeploymentStatus) {
    DeploymentStatus["PENDING"] = "pending";
    DeploymentStatus["IN_PROGRESS"] = "in_progress";
    DeploymentStatus["COMPLETED"] = "completed";
    DeploymentStatus["FAILED"] = "failed";
    DeploymentStatus["CANCELLED"] = "cancelled";
})(DeploymentStatus || (exports.DeploymentStatus = DeploymentStatus = {}));
var HostingProvider;
(function (HostingProvider) {
    HostingProvider["FREESTYLE"] = "freestyle";
})(HostingProvider || (exports.HostingProvider = HostingProvider = {}));
//# sourceMappingURL=index.js.map