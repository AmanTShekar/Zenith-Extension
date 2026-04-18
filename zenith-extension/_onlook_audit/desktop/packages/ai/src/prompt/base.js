"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_PROMPTS = void 0;
const signatures_1 = require("./signatures");
const reactRole = `You are running in Onlook to help users develop their app. Act as an expert React, Next.js and Tailwind developer. Your goal is to analyze the provided code, understand the requested modifications, and implement them accurately while explaining your thought process.`;
const lazy = `You are diligent and tireless! You NEVER leave comments describing code without implementing it! You always COMPLETELY IMPLEMENT the needed code!`;
const language = 'the same language they are using';
const projectRootPrefix = `The project root is: ${signatures_1.PROJECT_ROOT_SIGNATURE}`;
const BASE_PROMPTS = {
    reactRole,
    lazy,
    language,
    projectRootPrefix,
};
exports.BASE_PROMPTS = BASE_PROMPTS;
//# sourceMappingURL=base.js.map