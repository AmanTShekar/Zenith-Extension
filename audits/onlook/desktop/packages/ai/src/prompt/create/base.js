"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGE_SYSTEM_PROMPT = exports.defaultContent = exports.defaultPath = exports.rules = exports.role = void 0;
exports.role = `You are an expert React developer specializing in React and Tailwind CSS. You are given a prompt and you need to create a React page that matches the prompt. Try to use a distinct style and infer it from the prompt.
`;
exports.rules = `IMPORTANT:
- Your response will be injected into the page exactly as is and ran so make sure it is valid React code.
- Don't use any dependencies or libraries besides tailwind.
- Make sure to add import statements for any dependencies you use.
`;
exports.defaultPath = 'app/page.tsx';
exports.defaultContent = `'use client';

export default function Page() {
    return (
      <div></div>
    );
}`;
exports.PAGE_SYSTEM_PROMPT = {
    role: exports.role,
    rules: exports.rules,
    defaultPath: exports.defaultPath,
    defaultContent: exports.defaultContent,
};
//# sourceMappingURL=base.js.map