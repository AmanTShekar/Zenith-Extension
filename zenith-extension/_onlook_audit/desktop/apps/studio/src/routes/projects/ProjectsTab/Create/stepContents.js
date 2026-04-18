"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadProjectSteps = exports.newProjectSteps = void 0;
const SelectFolder_1 = require("./Load/SelectFolder");
const Setup_1 = require("./Load/Setup");
const SetUrl_1 = require("./Load/SetUrl");
const Warning_1 = require("./Load/Warning");
const Name_1 = require("./New/Name");
const SelectFolder_2 = require("./New/SelectFolder");
const Setup_2 = require("./New/Setup");
const withStepProps_1 = require("./withStepProps");
exports.newProjectSteps = [
    (0, withStepProps_1.withStepProps)(Name_1.NewNameProject),
    (0, withStepProps_1.withStepProps)(SelectFolder_2.NewSelectFolder),
    (0, withStepProps_1.withStepProps)(Setup_2.NewSetupProject),
];
exports.loadProjectSteps = [
    (0, withStepProps_1.withStepProps)(Warning_1.LoadWarning),
    (0, withStepProps_1.withStepProps)(SelectFolder_1.LoadSelectFolder),
    (0, withStepProps_1.withStepProps)(SetUrl_1.LoadSetUrl),
    (0, withStepProps_1.withStepProps)(Setup_1.LoadSetupProject),
];
//# sourceMappingURL=stepContents.js.map