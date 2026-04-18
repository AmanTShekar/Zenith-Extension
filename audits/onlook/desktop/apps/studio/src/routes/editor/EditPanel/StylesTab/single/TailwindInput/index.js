"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const style_1 = require("@/lib/editor/engine/style");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const textarea_1 = require("@onlook/ui/textarea");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_2 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const AutoComplete_1 = require("./AutoComplete");
const TailwindInput = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const suggestionRef = (0, react_1.useRef)(null);
    const [showSuggestions, setShowSuggestions] = (0, react_1.useState)(true);
    const [selectedEl, setSelectedEl] = (0, react_1.useState)();
    let resizeObserver;
    const instanceRef = (0, react_1.useRef)(null);
    const [instanceHistory, setInstanceHistory] = (0, react_1.useState)({
        past: [],
        present: '',
        future: [],
    });
    const [isInstanceFocused, setIsInstanceFocused] = (0, react_1.useState)(false);
    const rootRef = (0, react_1.useRef)(null);
    const [rootHistory, setRootHistory] = (0, react_1.useState)({
        past: [],
        present: '',
        future: [],
    });
    const [isRootFocused, setIsRootFocused] = (0, react_1.useState)(false);
    const updateHistory = (value, { past, present }, setHistory) => {
        setHistory({
            past: [...past, present],
            present: value,
            future: [],
        });
    };
    const didChangeFromOriginal = (history, value) => {
        if (history.past.length === 0) {
            return false;
        }
        return history.past[0] !== value;
    };
    const undo = (history, setHistory) => {
        const { past, present, future } = history;
        if (past.length === 0) {
            return;
        }
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        setHistory({
            past: newPast,
            present: previous,
            future: [present, ...future],
        });
    };
    const redo = (history, setHistory) => {
        const { past, present, future } = history;
        if (future.length === 0) {
            return;
        }
        const next = future[0];
        const newFuture = future.slice(1);
        setHistory({
            past: [...past, present],
            present: next,
            future: newFuture,
        });
    };
    const handleKeyDown = (e, history, setHistory) => {
        if (showSuggestions) {
            suggestionRef.current?.handleKeyDown(e);
            return;
        }
        if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') {
            e.currentTarget.blur();
            e.preventDefault();
            return;
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                redo(history, setHistory);
            }
            else {
                undo(history, setHistory);
            }
        }
    };
    (0, react_1.useEffect)(() => {
        if (editorEngine.elements.selected.length > 0) {
            const selectedEl = editorEngine.elements.selected[0];
            setSelectedEl(selectedEl);
            if (!isInstanceFocused) {
                getInstanceClasses(selectedEl);
            }
            if (!isRootFocused) {
                getRootClasses(selectedEl);
            }
        }
        else {
            setSelectedEl(undefined);
            setInstanceHistory({ past: [], present: '', future: [] });
            setRootHistory({ past: [], present: '', future: [] });
        }
    }, [
        editorEngine.elements.selected,
        editorEngine.ast.mappings.layers,
        editorEngine.history.length,
    ]);
    async function getInstanceClasses(domEl) {
        const newInstance = await editorEngine.ast.getTemplateNodeById(domEl.instanceId);
        if (newInstance) {
            const instanceClasses = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_TEMPLATE_NODE_CLASS, newInstance);
            if (instanceClasses.type === 'error') {
                console.warn(instanceClasses.reason);
            }
            setInstanceHistory({
                past: [],
                present: instanceClasses.type === 'classes'
                    ? instanceClasses.value.join(' ')
                    : instanceClasses.type,
                future: [],
                error: instanceClasses.type === 'error' ? instanceClasses.reason : undefined,
            });
        }
    }
    async function getRootClasses(domEl) {
        const newRoot = await editorEngine.ast.getTemplateNodeById(domEl.oid);
        if (newRoot) {
            const rootClasses = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_TEMPLATE_NODE_CLASS, newRoot);
            if (rootClasses.type === 'error') {
                console.warn(rootClasses.reason);
            }
            setRootHistory({
                past: [],
                present: rootClasses.type === 'classes' ? rootClasses.value.join(' ') : rootClasses.type,
                future: [],
                error: rootClasses.type === 'error' ? rootClasses.reason : undefined,
            });
        }
    }
    async function getPrevRootClasses(domEl) {
        try {
            const newRoot = await editorEngine.ast.getTemplateNodeById(domEl.oid);
            if (newRoot) {
                const rootClasses = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_TEMPLATE_NODE_CLASS, newRoot);
                if (rootClasses.type === 'error') {
                    console.warn(rootClasses.reason);
                }
                return rootClasses.type === 'classes' ? rootClasses.value : [];
            }
            return [];
        }
        catch (err) {
            console.log('erpr ', err);
            return [];
        }
    }
    const createCodeDiffRequest = async (oid, className) => {
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
        const selectedElements = editorEngine.elements.selected;
        const selectedElprevClasses = await getPrevRootClasses(selectedElements[0]);
        const computedClass = compareClassNames(selectedElprevClasses, className.split(' '));
        for (const ele of selectedElements) {
            let computedClassName = '';
            const isNonSelectedElement = ele.oid !== oid;
            if (isNonSelectedElement) {
                const prevClasses = await getPrevRootClasses(ele);
                computedClassName = computeClassForNonSelectedElement(computedClass.added, computedClass.removed, prevClasses);
            }
            else {
                computedClassName = className;
            }
            request.push({
                oid: ele.oid || '',
                attributes: { className: computedClassName },
                textContent: null,
                overrideClasses: true,
                structureChanges: [],
            });
        }
        const res = await editorEngine.code.getAndWriteCodeDiff(request, true);
        if (res) {
            (0, utils_1.sendAnalytics)('tailwind action');
        }
    };
    function computeClassForNonSelectedElement(addedClasses, removedClasses, originalClasses) {
        const finalClasses = [...originalClasses];
        let classRemoved = false;
        if (removedClasses.length > 0) {
            removedClasses.forEach((cls) => {
                const index = finalClasses.indexOf(cls);
                if (index !== -1) {
                    finalClasses.splice(index, 1);
                    classRemoved = true;
                }
            });
        }
        if (removedClasses.length > 0 && classRemoved) {
            addedClasses.forEach((cls) => {
                if (!finalClasses.includes(cls)) {
                    finalClasses.push(cls);
                }
            });
        }
        else {
            if (removedClasses.length === 0) {
                addedClasses.forEach((cls) => {
                    if (!finalClasses.includes(cls)) {
                        finalClasses.push(cls);
                    }
                });
            }
        }
        return finalClasses.join(' ');
    }
    function compareClassNames(oldClasses, newClasses) {
        const addedClasses = newClasses.filter((cls) => !oldClasses.includes(cls));
        const removedClasses = oldClasses.filter((cls) => !newClasses.includes(cls));
        return {
            added: addedClasses,
            removed: removedClasses,
        };
    }
    const handleInput = (e, history, setHistory) => {
        const { value, selectionStart } = e.currentTarget;
        updateHistory(value, history, setHistory);
        suggestionRef.current?.handleInput(value, selectionStart);
    };
    const adjustHeight = (textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight + 20}px`;
    };
    const navigateToTemplateNode = async (oid) => {
        if (!oid) {
            console.error('No templateNode ID provided for navigation.');
            return;
        }
        try {
            await window.api.invoke(constants_1.MainChannels.VIEW_SOURCE_CODE, oid);
        }
        catch (error) {
            console.error('Error opening TemplateNode in IDE:', error);
        }
    };
    (0, react_1.useEffect)(() => {
        if (instanceRef.current) {
            adjustHeight(instanceRef.current);
        }
    }, [instanceHistory.present]);
    (0, react_1.useEffect)(() => {
        if (rootRef.current) {
            adjustHeight(rootRef.current);
        }
        if (rootRef.current) {
            resizeObserver?.disconnect();
            resizeObserver = new ResizeObserver(() => {
                adjustHeight(rootRef.current);
            });
            resizeObserver.observe(rootRef.current);
            return () => {
                resizeObserver?.disconnect();
            };
        }
    }, [rootHistory.present]);
    const EnterIndicator = ({ isInstance = false }) => {
        return (<div className={(0, utils_2.cn)('absolute bottom-1 right-2 text-xs flex items-center', isInstance
                ? 'text-purple-300 dark:text-purple-300 selection:text-purple-50 selection:bg-purple-500/50 dark:selection:text-purple-50 dark:selection:bg-purple-500/50'
                : 'text-gray-500 selection:bg-gray-200 dark:selection:bg-gray-700')}>
                <span>enter to apply</span>
                <icons_1.Icons.Return className="ml-0.5"/>
            </div>);
    };
    return (<div className="flex flex-col gap-2 text-xs text-foreground-onlook shadow-none">
            {selectedEl?.oid && (<div className="relative">
                    <div className="group cursor-pointer">
                        {selectedEl.instanceId && (<tooltip_1.Tooltip>
                                <tooltip_1.TooltipTrigger asChild>
                                    <button className={(0, utils_2.cn)('w-full flex items-center rounded-t h-6 px-1.5 gap-1 transition-colors border-[0.5px]', editorEngine.style.mode === style_1.StyleMode.Root
                    ? 'bg-background-primary text-foreground-active border-background-tertiary'
                    : 'bg-background-secondary text-foreground-muted border-background-secondary group-hover:bg-background-primary/20 group-hover:text-foreground-active group-hover:border-background-tertiary/90 cursor-pointer')} onClick={() => {
                    editorEngine.style.mode = style_1.StyleMode.Root;
                    rootRef.current?.focus();
                }}>
                                        <icons_1.Icons.Component className="h-3 w-3"/>{' '}
                                        {'Main Component Classes'}
                                    </button>
                                </tooltip_1.TooltipTrigger>
                                <tooltip_1.TooltipPortal container={document.getElementById('style-tab-id')}>
                                    <tooltip_1.TooltipContent>
                                        {'Changes apply to component code. This is the default.'}
                                    </tooltip_1.TooltipContent>
                                </tooltip_1.TooltipPortal>
                            </tooltip_1.Tooltip>)}
                        <textarea_1.Textarea ref={rootRef} className={(0, utils_2.cn)('w-full text-xs break-normal p-1.5 focus-visible:ring-0 resize-none shadow-none border-[0.5px]', 'transition-colors duration-150', editorEngine.style.mode === style_1.StyleMode.Root
                ? 'bg-background-tertiary text-foreground-active border-background-tertiary cursor-text'
                : 'bg-background-secondary/75 text-foreground-muted border-background-secondary/75 group-hover:bg-background-tertiary/50 group-hover:text-foreground-active group-hover:border-background-tertiary/50 cursor-pointer', selectedEl.instanceId
                ? 'rounded-t-none'
                : 'bg-background-secondary/75 focus:bg-background-tertiary')} placeholder="Add tailwind classes here" value={rootHistory.error
                ? 'Warning: ' + rootHistory.error + ' Open the code to edit.'
                : rootHistory.present} readOnly={!!rootHistory.error} onInput={(e) => handleInput(e, rootHistory, setRootHistory)} onKeyDown={(e) => handleKeyDown(e, rootHistory, setRootHistory)} onBlur={(e) => {
                setShowSuggestions(false);
                setIsRootFocused(false);
                selectedEl.oid &&
                    didChangeFromOriginal(rootHistory, e.target.value) &&
                    createCodeDiffRequest(selectedEl.oid, e.target.value);
            }} onFocus={() => {
                editorEngine.style.mode = style_1.StyleMode.Root;
                setIsRootFocused(true);
            }} onClick={() => {
                if (editorEngine.style.mode !== style_1.StyleMode.Root) {
                    editorEngine.style.mode = style_1.StyleMode.Root;
                    rootRef.current?.focus();
                }
            }}/>
                        {isRootFocused && (<AutoComplete_1.AutoComplete ref={suggestionRef} showSuggestions={showSuggestions} currentInput={rootHistory.present} setShowSuggestions={setShowSuggestions} setCurrentInput={(newValue) => {
                    updateHistory(newValue, rootHistory, setRootHistory);
                    selectedEl.oid &&
                        didChangeFromOriginal(rootHistory, newValue) &&
                        createCodeDiffRequest(selectedEl.oid, newValue);
                }}/>)}
                    </div>
                    {rootHistory.error ? (<div className="absolute bottom-1 right-1 text-xs flex items-center">
                            <button_1.Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation(); // Prevents unfocusing the textarea
                    navigateToTemplateNode(selectedEl?.oid);
                }}>
                                Open <icons_1.Icons.ExternalLink className="h-3 w-3 ml-1"/>
                            </button_1.Button>
                        </div>) : (isRootFocused && <EnterIndicator />)}
                </div>)}

            {selectedEl?.instanceId && (<div className="relative">
                    <div className={(0, utils_2.cn)('group', editorEngine.style.mode !== style_1.StyleMode.Instance && 'cursor-pointer')}>
                        <tooltip_1.Tooltip>
                            <tooltip_1.TooltipTrigger asChild>
                                <button className={(0, utils_2.cn)('w-full flex items-center rounded-t h-6 px-1.5 gap-1 transition-colors border-[0.5px]', editorEngine.style.mode === style_1.StyleMode.Instance
                ? 'bg-purple-600 text-purple-50 border-purple-600 dark:bg-purple-700 dark:text-purple-50 dark:border-purple-700'
                : 'bg-background-secondary text-foreground-muted border-background-secondary/90 group-hover:bg-purple-200 group-hover:text-purple-900 group-hover:border-purple-200 dark:group-hover:bg-purple-900/50 dark:group-hover:text-purple-100 dark:group-hover:border-purple-900/50')} onClick={() => {
                editorEngine.style.mode = style_1.StyleMode.Instance;
                instanceRef.current?.focus();
            }}>
                                    <icons_1.Icons.ComponentInstance className="h-3 w-3"/> Instance Classes
                                </button>
                            </tooltip_1.TooltipTrigger>
                            <tooltip_1.TooltipPortal container={document.getElementById('style-tab-id')}>
                                <tooltip_1.TooltipContent>{'Changes apply to instance code.'}</tooltip_1.TooltipContent>
                            </tooltip_1.TooltipPortal>
                        </tooltip_1.Tooltip>
                        <textarea_1.Textarea ref={instanceRef} className={(0, utils_2.cn)('w-full text-xs break-normal p-1.5 focus-visible:ring-0 resize-none shadow-none rounded-t-none border-[0.5px]', 'transition-colors duration-150', editorEngine.style.mode === style_1.StyleMode.Instance
                ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900/75 dark:text-purple-100 dark:border-purple-600'
                : 'bg-background-secondary/75 text-foreground-muted border-background-secondary/75 group-hover:bg-purple-100/50 group-hover:text-purple-900 group-hover:border-purple-200 dark:group-hover:bg-purple-900/30 dark:group-hover:text-purple-100 dark:group-hover:border-purple-900/30 cursor-pointer')} placeholder="Add tailwind classes here" value={instanceHistory.error
                ? 'Warning: ' +
                    instanceHistory.error +
                    ' Open the code to edit.'
                : instanceHistory.present} readOnly={!!instanceHistory.error} onInput={(e) => handleInput(e, instanceHistory, setInstanceHistory)} onKeyDown={(e) => handleKeyDown(e, instanceHistory, setInstanceHistory)} onBlur={(e) => {
                setShowSuggestions(false);
                setIsInstanceFocused(false);
                selectedEl?.instanceId &&
                    didChangeFromOriginal(instanceHistory, e.target.value) &&
                    createCodeDiffRequest(selectedEl.instanceId, e.target.value);
            }} onFocus={() => {
                editorEngine.style.mode = style_1.StyleMode.Instance;
                setIsInstanceFocused(true);
            }} onClick={() => {
                if (editorEngine.style.mode !== style_1.StyleMode.Instance) {
                    editorEngine.style.mode = style_1.StyleMode.Instance;
                    instanceRef.current?.focus();
                }
            }}/>
                        {isInstanceFocused && (<AutoComplete_1.AutoComplete ref={suggestionRef} showSuggestions={showSuggestions} currentInput={instanceHistory.present} setShowSuggestions={setShowSuggestions} setCurrentInput={(newValue) => {
                    updateHistory(newValue, instanceHistory, setInstanceHistory);
                    selectedEl?.instanceId &&
                        didChangeFromOriginal(instanceHistory, newValue) &&
                        createCodeDiffRequest(selectedEl?.instanceId, newValue);
                }}/>)}
                    </div>
                    {instanceHistory.error ? (<div className="absolute bottom-1 right-2 text-xs flex items-center">
                            <button_1.Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation(); // Prevents unfocusing the textarea
                    navigateToTemplateNode(selectedEl?.oid);
                }}>
                                Open <icons_1.Icons.ExternalLink className="h-3 w-3 ml-1"/>
                            </button_1.Button>
                        </div>) : (isInstanceFocused && <EnterIndicator />)}
                </div>)}
        </div>);
});
exports.default = TailwindInput;
//# sourceMappingURL=index.js.map