"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const TextInput_1 = __importDefault(require("../single/TextInput"));
const utils_1 = require("@onlook/ui/utils");
const SelectInput_1 = __importDefault(require("../single/SelectInput"));
const index_1 = require("@onlook/ui/icons/index");
const PositionLine = ({ position, isActive, onClick }) => {
    const positionStyles = {
        top: 'top-0.5 w-[calc(100%-16px)] left-[8px]',
        right: 'right-0.5 h-[calc(100%-16px)] top-[8px]',
        bottom: 'bottom-0.5 w-[calc(100%-16px)] left-[8px]',
        left: 'left-0.5 h-[calc(100%-16px)] top-[8px]',
    };
    const lineStyles = {
        top: 'w-1 h-3',
        right: 'h-1 w-3',
        bottom: 'w-1 h-3',
        left: 'h-1 w-3',
    };
    return (<div className={(0, utils_1.cn)('absolute cursor-pointer transition-colors flex items-center justify-center ', positionStyles[position])} onClick={() => onClick(position)}>
            <div className={(0, utils_1.cn)('rounded-full', lineStyles[position], isActive
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-background-active hover:bg-primary')}/>
        </div>);
};
const CenterButton = ({ isCenter, onClick }) => (<div className="bg-background-onlook rounded relative flex items-center justify-center px-2 py-2 border border-background-active" onClick={onClick}>
        <index_1.Icons.Plus className={(0, utils_1.cn)('w-4 h-4 hover:text-red-500 transition-colors hover:cursor-pointer hover:scale-110', isCenter ? 'text-red-500' : 'text-gray-400')}/>
    </div>);
const PositionInput = (0, mobx_react_lite_1.observer)(({ compoundStyle }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [lines, setLines] = (0, react_1.useState)({
        top: false,
        bottom: false,
        left: false,
        right: false,
    });
    const [isCentered, setIsCentered] = (0, react_1.useState)(false);
    const resetPositionState = () => {
        setLines({
            top: false,
            bottom: false,
            left: false,
            right: false,
        });
    };
    const onLineClicked = (position) => {
        setLines((prev) => {
            const newState = { ...prev, [position]: !prev[position], center: false };
            if (!newState[position]) {
                editorEngine.style.update(position, 'auto');
            }
            return newState;
        });
    };
    const onMainValueChanged = (key, value) => {
        editorEngine.history.startTransaction();
        if (value === 'absolute') {
            editorEngine.style.update('position', value);
            editorEngine.history.commitTransaction();
            centerElement();
        }
        else {
            editorEngine.style.update('position', value);
            editorEngine.history.commitTransaction();
            const updates = Object.fromEntries(compoundStyle.children.map((elementStyle) => [elementStyle.key, 'auto']));
            editorEngine.style.updateMultiple(updates);
            resetPositionState();
        }
    };
    const getElementAndParent = async () => {
        const elements = editorEngine.elements.selected;
        if (elements.length === 0) {
            return null;
        }
        const results = [];
        for (const element of elements) {
            if (!element?.domId) {
                continue;
            }
            const webview = editorEngine.webviews.getWebview(element.webviewId);
            if (!webview) {
                continue;
            }
            const parent = await webview.executeJavaScript(`window.api?.getParentElement('${element.domId}')`);
            if (!parent) {
                continue;
            }
            results.push({ element, parent });
        }
        return results.length > 0 ? results : null;
    };
    const centerElement = async () => {
        const elementPairs = await getElementAndParent();
        if (!elementPairs) {
            return;
        }
        if (isCentered) {
            return;
        }
        const updates = {};
        for (const { element, parent } of elementPairs) {
            const centerX = (parent.rect.width - element.rect.width) / 2;
            const centerY = (parent.rect.height - element.rect.height) / 2;
            updates.left = `${Math.round(centerX)}px`;
            updates.top = `${Math.round(centerY)}px`;
        }
        editorEngine.style.updateMultiple(updates);
    };
    const checkIfCentered = (0, react_1.useCallback)(async () => {
        const elementPairs = await getElementAndParent();
        if (!elementPairs) {
            return false;
        }
        const allCentered = elementPairs.every(({ element, parent }) => {
            const centerX = (parent.rect.width - element.rect.width) / 2;
            const centerY = (parent.rect.height - element.rect.height) / 2;
            const currentLeft = element.rect.x - parent.rect.x;
            const currentTop = element.rect.y - parent.rect.y;
            return Math.abs(currentLeft - centerX) < 1 && Math.abs(currentTop - centerY) < 1;
        });
        setIsCentered(allCentered);
        return allCentered;
    }, [editorEngine.style.selectedStyle]);
    const renderMainControl = () => (<div className="flex flex-row items-center justify-between w-full">
            <p className="text-xs text-foreground-onlook">{compoundStyle.head.displayName}</p>
            <div className="flex flex-row space-x-1">
                <SelectInput_1.default elementStyle={compoundStyle.head} onValueChange={onMainValueChanged}/>
            </div>
        </div>);
    const renderLines = (0, react_1.useCallback)(() => {
        return (<div className="w-16 h-16 bg-background-onlook rounded relative flex items-center justify-center px-4 py-4">
                <CenterButton isCenter={isCentered} onClick={centerElement}/>
                {['top', 'right', 'bottom', 'left'].map((position) => (<PositionLine key={position} position={position} isActive={lines[position]} onClick={onLineClicked}/>))}
            </div>);
    }, [lines, centerElement, isCentered]);
    const renderPositionInputs = (0, react_1.useCallback)(() => {
        const elementStyles = compoundStyle.children;
        const currentPosition = compoundStyle.head.getValue(editorEngine.style.selectedStyle?.styles || {});
        if (currentPosition !== 'absolute') {
            return null;
        }
        const positionStyles = {
            top: 'top-0 left-1/2 -translate-x-1/2',
            bottom: 'bottom-0 left-1/2 -translate-x-1/2',
            left: 'left-0 top-1/2 -translate-y-1/2',
            right: 'right-0 top-1/2 -translate-y-1/2',
        };
        return (<div className="relative h-36 w-52 flex items-center justify-center mb-4 mx-auto">
                {elementStyles.map((elementStyle) => {
                const position = elementStyle.key.toLowerCase();
                const isActive = lines[position];
                return (<TextInput_1.default key={elementStyle.key} elementStyle={elementStyle} disabled={!isActive} className={(0, utils_1.cn)('absolute w-16 bg-background-onlook text-foreground-onlook text-center rounded p-2', positionStyles[position], !isActive && 'opacity-50 cursor-not-allowed')}/>);
            })}
                {renderLines()}
            </div>);
    }, [compoundStyle.children, editorEngine.style.selectedStyle, lines, renderLines]);
    (0, react_1.useEffect)(() => {
        const updatePosition = async () => {
            const selectedStyle = editorEngine.style.selectedStyle;
            if (!selectedStyle) {
                return;
            }
            const position = selectedStyle.styles['position'];
            if (position === 'absolute') {
                setLines({
                    top: selectedStyle.styles['top'] !== 'auto',
                    bottom: selectedStyle.styles['bottom'] !== 'auto',
                    left: selectedStyle.styles['left'] !== 'auto',
                    right: selectedStyle.styles['right'] !== 'auto',
                });
            }
        };
        checkIfCentered();
        updatePosition();
    }, [editorEngine.style.selectedStyle]);
    return (<div className="space-y-2">
            {renderMainControl()}
            {renderPositionInputs()}
        </div>);
});
exports.default = PositionInput;
//# sourceMappingURL=PositionInput.js.map