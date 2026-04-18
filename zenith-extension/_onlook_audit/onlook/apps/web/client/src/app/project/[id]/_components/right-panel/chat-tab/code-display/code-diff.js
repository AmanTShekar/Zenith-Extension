"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeDiff = void 0;
const models_1 = require("@onlook/models");
const next_themes_1 = require("next-themes");
const react_codemirror_merge_1 = __importDefault(require("react-codemirror-merge"));
const code_mirror_config_1 = require("../../../left-panel/code-panel/code-tab/file-content/code-mirror-config");
const Original = react_codemirror_merge_1.default.Original;
const Modified = react_codemirror_merge_1.default.Modified;
const CodeDiff = ({ originalCode, modifiedCode }) => {
    const { theme } = (0, next_themes_1.useTheme)();
    const extensions = (0, code_mirror_config_1.getExtensions)('javascript');
    return (<react_codemirror_merge_1.default orientation="a-b" theme={theme === models_1.SystemTheme.DARK ? models_1.SystemTheme.DARK : models_1.SystemTheme.LIGHT}>
            <Original value={originalCode} extensions={extensions} readOnly/>
            <Modified value={modifiedCode} extensions={extensions} readOnly/>
        </react_codemirror_merge_1.default>);
};
exports.CodeDiff = CodeDiff;
//# sourceMappingURL=code-diff.js.map