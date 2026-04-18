"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = exports.traverse = exports.generate = exports.parse = void 0;
const standalone_1 = require("@babel/standalone");
exports.parse = standalone_1.packages.parser.parse;
exports.generate = standalone_1.packages.generator.generate;
exports.traverse = standalone_1.packages.traverse.default;
exports.t = standalone_1.packages.types;
//# sourceMappingURL=packages.js.map