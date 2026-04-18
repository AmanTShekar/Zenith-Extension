"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const tag_1 = require("@/lib/editor/styles/tag");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const TagDetails = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const tagName = editorEngine.elements.selected[0].tagName;
    const [showMore, setShowMore] = (0, react_2.useState)(false);
    const [tagInfo, setTagInfo] = (0, react_2.useState)({
        title: '',
        description: '',
    });
    (0, react_2.useEffect)(() => {
        const info = tag_1.TAG_INFO[tagName.toLowerCase()] ?? {
            title: 'Element',
            description: '',
        };
        setTagInfo(info);
    }, [tagName]);
    const toggleShowMore = () => {
        setShowMore(!showMore);
    };
    return (<button className="text-start w-full p-2 mb-3 bg-background-onlook/75 rounded text-xs cursor-pointer overflow-hidden" onClick={toggleShowMore} style={{ transform: 'height 0.2s' }}>
            <p className="space-x-1">
                <span className="capitalize">{tagName.toLowerCase()}</span>
                <span>
                    {tagInfo.title.toLowerCase() === tagName.toLowerCase() ? '' : tagInfo.title}
                </span>
            </p>
            <react_1.motion.div initial={{ height: 0 }} animate={{ height: showMore ? 'auto' : 0 }} exit={{ height: 0 }} transition={{ duration: 0.3 }}>
                <p className="pt-2 whitespace-pre-line">{tagInfo.description}</p>
                <p className="pt-2 text-xs underline">
                    <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element" target="_blank" rel="noopener noreferrer">
                        Learn more
                    </a>
                </p>
            </react_1.motion.div>
        </button>);
});
exports.default = TagDetails;
//# sourceMappingURL=TagDetails.js.map