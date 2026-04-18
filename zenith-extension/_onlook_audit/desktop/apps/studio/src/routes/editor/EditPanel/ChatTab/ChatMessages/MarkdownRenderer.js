"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@onlook/ui/utils");
const react_markdown_1 = __importDefault(require("react-markdown"));
const remark_gfm_1 = __importDefault(require("remark-gfm"));
const CodeChangeDisplay_1 = __importDefault(require("../CodeChangeDisplay"));
const BashCodeDisplay_1 = __importDefault(require("../CodeChangeDisplay/BashCodeDisplay"));
const MarkdownRenderer = ({ messageId, content, className = '', applied, isStream, }) => {
    const transformedContent = content.replace(/^(.*?)\n```(\w+)\n/gm, (_, filePath, language) => `\`\`\`${language}:${filePath}\n`);
    return (<div className={(0, utils_1.cn)('prose prose-stone dark:prose-invert prose-compact text-small break-words', className)}>
            <react_markdown_1.default remarkPlugins={[remark_gfm_1.default]} components={{
            pre: ({ node, ...props }) => (<pre className="m-0 p-0 mb-2 rounded-lg bg-none border-0.5 border-border-primary" {...props}/>),
            code({ node, className, children, ...props }) {
                const match = /language-(\w+)(:?.+)?/.exec(className || '');
                const language = match?.[1];
                const filePath = match?.[2]?.substring(1);
                const codeContent = String(children).replace(/\n$/, '');
                if (language === 'bash') {
                    return <BashCodeDisplay_1.default content={codeContent} isStream={isStream}/>;
                }
                if (match && filePath) {
                    return (<CodeChangeDisplay_1.default path={filePath} content={codeContent} messageId={messageId} applied={applied} isStream={isStream}/>);
                }
                return (<code className={className} {...props}>
                                {children}
                            </code>);
            },
        }}>
                {transformedContent}
            </react_markdown_1.default>
        </div>);
};
exports.default = MarkdownRenderer;
//# sourceMappingURL=MarkdownRenderer.js.map