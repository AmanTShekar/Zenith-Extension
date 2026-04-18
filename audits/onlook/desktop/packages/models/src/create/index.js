"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupStage = exports.VerifyStage = exports.CreateStage = void 0;
var CreateStage;
(function (CreateStage) {
    CreateStage["CLONING"] = "cloning";
    CreateStage["GIT_INIT"] = "git_init";
    CreateStage["INSTALLING"] = "installing";
    CreateStage["COMPLETE"] = "complete";
    CreateStage["ERROR"] = "error";
})(CreateStage || (exports.CreateStage = CreateStage = {}));
var VerifyStage;
(function (VerifyStage) {
    VerifyStage["CHECKING"] = "checking";
    VerifyStage["NOT_INSTALLED"] = "not_installed";
    VerifyStage["INSTALLED"] = "installed";
    VerifyStage["ERROR"] = "error";
})(VerifyStage || (exports.VerifyStage = VerifyStage = {}));
var SetupStage;
(function (SetupStage) {
    SetupStage["INSTALLING"] = "installing";
    SetupStage["CONFIGURING"] = "configuring";
    SetupStage["COMPLETE"] = "complete";
    SetupStage["ERROR"] = "error";
})(SetupStage || (exports.SetupStage = SetupStage = {}));
//# sourceMappingURL=index.js.map