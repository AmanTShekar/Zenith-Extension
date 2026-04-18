"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_PROMPTS = void 0;
const signatures_1 = require("./signatures");
const language = 'the same language they are using';
const projectRootPrefix = `The project root is: ${signatures_1.PROJECT_ROOT_SIGNATURE}`;
const BASE_PROMPTS = {
    language,
    projectRootPrefix,
};
exports.BASE_PROMPTS = BASE_PROMPTS;
//# sourceMappingURL=base.js.map