"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropsTab = void 0;
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const element_1 = require("@onlook/models/element");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const react_1 = require("react");
const BooleanProp_1 = __importDefault(require("./BooleanProp"));
const CodeProp_1 = __importDefault(require("./CodeProp"));
const TextProp_1 = __importDefault(require("./TextProp"));
const PropsTab = () => {
    const [props, setProps] = (0, react_1.useState)({});
    const [selectedEl, setSelectedEl] = (0, react_1.useState)();
    const editorEngine = (0, Context_1.useEditorEngine)();
    (0, react_1.useEffect)(() => {
        if (editorEngine.elements.selected.length > 0) {
            const selectedEl = editorEngine.elements.selected[0];
            setSelectedEl(selectedEl);
            getRootProps(selectedEl);
        }
    }, [editorEngine.elements.selected]);
    async function getRootProps(domEl) {
        const newRoot = await editorEngine.ast.getTemplateNodeById(domEl.oid);
        if (newRoot) {
            const rootProps = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_TEMPLATE_NODE_PROPS, newRoot);
            if (rootProps.type === 'props' && rootProps.props.length > 0) {
                const elementProps = {};
                rootProps.props.forEach((prop) => {
                    const newProp = {
                        type: prop.type,
                        value: prop.value,
                    };
                    elementProps[prop.key] = newProp;
                });
                setProps(elementProps);
            }
            else {
                setProps(null);
            }
        }
    }
    const createCodeDiffRequest = async (oid, value, name) => {
        if (!oid) {
            console.error('No oid found for createCodeDiffRequest');
            return;
        }
        const templateNode = await editorEngine.ast.getTemplateNodeById(oid);
        if (!templateNode) {
            console.error('No templateNode found for createCodeDiffRequest');
            return;
        }
        const request = [];
        request.push({
            oid,
            attributes: { [name]: value },
            textContent: null,
            overrideClasses: false,
            structureChanges: [],
        });
        const res = await editorEngine.code.getAndWriteCodeDiff(request, true);
        if (res) {
            (0, utils_1.sendAnalytics)('attributes action');
        }
    };
    function viewSource() {
        if (selectedEl?.oid) {
            editorEngine.code.viewSource(selectedEl?.oid);
        }
    }
    return (<div className="flex flex-col gap-2 px-3 w-full">
            <div className="flex flex-row justify-between items-center">
                <span className="text-xs">Detected Properties</span>
                <button_1.Button size={'icon'} variant={'ghost'}>
                    <index_1.Icons.Plus />
                </button_1.Button>
            </div>
            <div className="flex flex-col gap-4 mb-5">
                {props !== null &&
            Object.keys(props).map((key) => {
                const prop = props[key];
                return (<div className="flex flex-row items-center" key={key}>
                                <div className="flex flex-row gap-2 items-center">
                                    <div className="flex flex-col">
                                        <span className="text-sm">{key}</span>
                                        <span className="text-xs text-foreground-secondary">
                                            {prop.displayType ? prop.displayType : prop.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-end ml-auto">
                                    {prop.type === 'code' ? (<CodeProp_1.default onClick={viewSource}/>) : prop.type === 'boolean' ? (<BooleanProp_1.default value={prop.value} change={(value) => {
                            setProps((prev) => prev !== null
                                ? {
                                    ...prev,
                                    [key]: {
                                        ...prev[key],
                                        value,
                                    },
                                }
                                : null);
                            selectedEl?.oid &&
                                createCodeDiffRequest(selectedEl?.oid, value, key);
                        }}/>) : ((prop.type === element_1.PropsType.String ||
                        prop.type === element_1.PropsType.Number) && (<TextProp_1.default prop={prop} type={prop.type} onChange={(value) => {
                            setProps((prev) => prev !== null
                                ? {
                                    ...prev,
                                    [key]: {
                                        ...prev[key],
                                        value,
                                    },
                                }
                                : null);
                        }} onBlur={(val) => {
                            selectedEl?.oid &&
                                createCodeDiffRequest(selectedEl?.oid, prop.type === element_1.PropsType.Number
                                    ? parseInt(val)
                                    : val, key);
                        }}/>))}
                                </div>
                            </div>);
            })}
            </div>
        </div>);
};
exports.PropsTab = PropsTab;
//# sourceMappingURL=index.js.map