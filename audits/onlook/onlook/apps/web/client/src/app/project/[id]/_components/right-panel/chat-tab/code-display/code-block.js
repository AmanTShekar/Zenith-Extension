"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeBlock = void 0;
const code_mirror_config_1 = require("@/app/project/[id]/_components/left-panel/code-panel/code-tab/file-content/code-mirror-config");
const models_1 = require("@onlook/models");
const utils_1 = require("@onlook/ui/utils");
const codemirror_extensions_basic_setup_1 = require("@uiw/codemirror-extensions-basic-setup");
const react_codemirror_1 = __importDefault(require("@uiw/react-codemirror"));
const CodeBlock = ({ className, code, }) => {
    const languageExtension = (0, code_mirror_config_1.getExtensions)('javascript');
    const extensions = [
        (0, codemirror_extensions_basic_setup_1.basicSetup)({
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLineGutter: false,
        }),
        ...languageExtension,
    ];
    return (<div className="flex flex-col w-full h-full">
            <react_codemirror_1.default value={code} readOnly={true} className={(0, utils_1.cn)('flex-1 w-full h-full min-h-full max-h-full overflow-auto', className)} theme={models_1.SystemTheme.DARK} extensions={extensions}/>
        </div>);
};
exports.CodeBlock = CodeBlock;
//# sourceMappingURL=code-block.js.map