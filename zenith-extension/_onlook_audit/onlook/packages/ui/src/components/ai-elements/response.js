"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
const react_1 = require("react");
const streamdown_1 = require("streamdown");
const utils_1 = require("../../utils");
exports.Response = (0, react_1.memo)(({ className, ...props }) => (<streamdown_1.Streamdown className={(0, utils_1.cn)('size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)} {...props}/>), (prevProps, nextProps) => prevProps.children === nextProps.children);
exports.Response.displayName = 'Response';
//# sourceMappingURL=response.js.map