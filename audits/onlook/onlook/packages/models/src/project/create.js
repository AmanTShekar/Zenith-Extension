"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectCreateRequestStatus = exports.CreateRequestContextType = void 0;
var CreateRequestContextType;
(function (CreateRequestContextType) {
    CreateRequestContextType["PROMPT"] = "prompt";
    CreateRequestContextType["IMAGE"] = "image";
})(CreateRequestContextType || (exports.CreateRequestContextType = CreateRequestContextType = {}));
var ProjectCreateRequestStatus;
(function (ProjectCreateRequestStatus) {
    ProjectCreateRequestStatus["PENDING"] = "pending";
    ProjectCreateRequestStatus["COMPLETED"] = "completed";
    ProjectCreateRequestStatus["FAILED"] = "failed";
})(ProjectCreateRequestStatus || (exports.ProjectCreateRequestStatus = ProjectCreateRequestStatus = {}));
//# sourceMappingURL=create.js.map