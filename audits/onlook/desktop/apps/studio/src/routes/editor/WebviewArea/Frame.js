"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const webview_1 = require("@/lib/editor/engine/webview");
const models_1 = require("@/lib/models");
const constants_1 = require("@onlook/models/constants");
const run_1 = require("@onlook/models/run");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const shine_border_1 = require("@onlook/ui/shine-border");
const utils_1 = require("@onlook/ui/utils");
const framer_motion_1 = require("framer-motion");
const debounce_1 = __importDefault(require("lodash/debounce"));
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const BrowserControl_1 = __importDefault(require("./BrowserControl"));
const GestureScreen_1 = __importDefault(require("./GestureScreen"));
const ResizeHandles_1 = __importDefault(require("./ResizeHandles"));
const Frame = (0, mobx_react_lite_1.observer)(({ messageBridge, settings, }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const RETRY_TIMEOUT = 3000;
    const DOM_FAILED_DELAY = 3000;
    const { t } = (0, react_i18next_1.useTranslation)();
    const webviewRef = (0, react_1.useRef)(null);
    let domState = editorEngine.webviews.getState(settings.id);
    const [selected, setSelected] = (0, react_1.useState)(editorEngine.webviews.isSelected(settings.id));
    const [hovered, setHovered] = (0, react_1.useState)(false);
    const [darkmode, setDarkmode] = (0, react_1.useState)(false);
    const [domReady, setDomReady] = (0, react_1.useState)(false);
    const [domFailed, setDomFailed] = (0, react_1.useState)(false);
    const [shouldShowDomFailed, setShouldShowDomFailed] = (0, react_1.useState)(false);
    const [selectedPreset, setSelectedPreset] = (0, react_1.useState)(null);
    const [lockedPreset, setLockedPreset] = (0, react_1.useState)(null);
    const [webviewSize, setWebviewSize] = (0, react_1.useState)(settings.dimension);
    const [webviewSrc, setWebviewSrc] = (0, react_1.useState)(settings.url);
    const [webviewPosition, setWebviewPosition] = (0, react_1.useState)(settings.position);
    const [isResizing, setIsResizing] = (0, react_1.useState)(false);
    const [aspectRatioLocked, setAspectRatioLocked] = (0, react_1.useState)(settings.aspectRatioLocked || constants_1.DefaultSettings.ASPECT_RATIO_LOCKED);
    const clampedDimensions = (0, react_1.useMemo)(() => ({
        width: Math.max(webviewSize.width, parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width)),
        height: Math.max(webviewSize.height, parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height)),
    }), [webviewSize]);
    const debouncedSaveFrame = (0, react_1.useCallback)((0, debounce_1.default)((id, frameData) => {
        editorEngine.canvas.saveFrame(id, frameData);
    }, 100), [editorEngine.canvas]);
    const handleUrlChange = (0, react_1.useCallback)((e) => {
        setWebviewSrc(e.url);
        editorEngine.pages.handleWebviewUrlChange(settings.id);
    }, [editorEngine.pages, settings.id]);
    const handleDomReady = (0, react_1.useCallback)(async () => {
        const webview = webviewRef.current;
        if (!webview) {
            return;
        }
        await webview.executeJavaScript(`window.api?.setWebviewId('${webview.id}')`);
        setDomReady(true);
        webview.setZoomLevel(0);
        const body = await editorEngine.ast.getBodyFromWebview(webview);
        setDomFailed(body.children.length === 0);
        const state = editorEngine.webviews.computeState(body);
        editorEngine.webviews.setState(webview, state);
        setTimeout(() => {
            getDarkMode(webview);
        }, 100);
        webview.executeJavaScript(`window.api?.processDom()`);
    }, [editorEngine.ast, editorEngine.webviews]);
    (0, react_1.useEffect)(() => {
        const observer = (newSettings) => {
            const newDimensions = {
                width: newSettings.dimension.width,
                height: newSettings.dimension.height,
            };
            if (newSettings.aspectRatioLocked !== aspectRatioLocked) {
                setAspectRatioLocked(newSettings.aspectRatioLocked || constants_1.DefaultSettings.ASPECT_RATIO_LOCKED);
            }
            if (newSettings.dimension.width !== webviewSize.width ||
                newSettings.dimension.height !== webviewSize.height) {
                setWebviewSize(newDimensions);
            }
        };
        editorEngine.canvas.observeSettings(settings.id, observer);
        return editorEngine.canvas.unobserveSettings(settings.id, observer);
    }, []);
    (0, react_1.useEffect)(setupFrame, [webviewRef]);
    (0, react_1.useEffect)(() => setSelected(editorEngine.webviews.isSelected(settings.id)), [editorEngine.webviews.webviews]);
    (0, react_1.useEffect)(() => {
        if (projectsManager.runner?.state === run_1.RunState.STOPPING) {
            const refresh = () => {
                const webview = webviewRef.current;
                if (webview) {
                    try {
                        webview.reload();
                    }
                    catch (error) {
                        console.error('Failed to reload webview', error);
                    }
                }
            };
            setTimeout(refresh, RETRY_TIMEOUT);
            setTimeout(refresh, 500);
        }
    }, [projectsManager.runner?.state]);
    (0, react_1.useEffect)(() => {
        if (settings.dimension.width !== webviewSize.width ||
            settings.dimension.height !== webviewSize.height ||
            settings.position.x !== webviewPosition.x ||
            settings.position.y !== webviewPosition.y ||
            settings.url !== webviewSrc) {
            debouncedSaveFrame(settings.id, {
                url: webviewSrc,
                dimension: webviewSize,
                position: webviewPosition,
            });
        }
    }, [webviewSize, webviewSrc, webviewPosition]);
    (0, react_1.useEffect)(() => {
        let timer;
        if (domFailed) {
            timer = setTimeout(() => {
                setShouldShowDomFailed(true);
            }, DOM_FAILED_DELAY);
        }
        else {
            setShouldShowDomFailed(false);
        }
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [domFailed]);
    (0, react_1.useEffect)(() => {
        const webview = webviewRef.current;
        setWebviewSize(settings.dimension);
        setWebviewPosition(settings.position);
        setWebviewSrc(settings.url);
        setAspectRatioLocked(settings.aspectRatioLocked || constants_1.DefaultSettings.ASPECT_RATIO_LOCKED);
        if (webview) {
            webview.id = settings.id;
            setupFrame();
            domState = editorEngine.webviews.getState(settings.id);
        }
    }, [settings.id, settings.url]);
    function setupFrame() {
        const webview = webviewRef.current;
        if (!webview) {
            return;
        }
        editorEngine.webviews.register(webview);
        messageBridge.register(webview, settings.id);
        setBrowserEventListeners(webview);
        return () => {
            editorEngine.webviews.deregister(webview);
            messageBridge.deregister(webview);
            webview.removeEventListener('did-navigate', handleUrlChange);
        };
    }
    function deregisterWebview() {
        const webview = webviewRef.current;
        if (!webview) {
            return;
        }
        editorEngine.webviews.deregister(webview);
        messageBridge.deregister(webview);
        webview.removeEventListener('did-navigate', handleUrlChange);
    }
    function setBrowserEventListeners(webview) {
        webview.addEventListener('did-navigate', handleUrlChange);
        webview.addEventListener('did-navigate-in-page', handleUrlChange);
        webview.addEventListener('dom-ready', handleDomReady);
        webview.addEventListener('did-fail-load', handleDomFailed);
        webview.addEventListener('focus', handleWebviewFocus);
        webview.addEventListener('console-message', handleConsoleMessage);
    }
    async function getDarkMode(webview) {
        const darkmode = (await webview.executeJavaScript(`window.api?.getTheme()`)) || 'light';
        setDarkmode(darkmode === 'dark');
    }
    function handleDomFailed() {
        setDomFailed(true);
        const webview = webviewRef.current;
        if (!webview) {
            return;
        }
        editorEngine.webviews.setState(webview, webview_1.WebviewState.RUNNING_NO_DOM);
        setTimeout(() => {
            if (webview) {
                try {
                    webview.reload();
                }
                catch (error) {
                    console.error('Failed to reload webview', error);
                }
            }
        }, RETRY_TIMEOUT);
    }
    function handleWebviewFocus() {
        editorEngine.webviews.deselectAll();
        editorEngine.webviews.select(webviewRef.current);
    }
    function handleConsoleMessage(event) {
        if (event.sourceId === 'chrome-error://chromewebdata/') {
            // This is a chrome error from renderer, we don't want to show it
            return;
        }
        if (event.level === 3) {
            editorEngine.errors.addError(settings.id, event);
        }
    }
    function startMove(e) {
        e.preventDefault();
        e.stopPropagation();
        editorEngine.overlay.clear();
        const startX = e.clientX;
        const startY = e.clientY;
        const move = (e) => {
            const scale = editorEngine.canvas.scale;
            const deltaX = (e.clientX - startX) / scale;
            const deltaY = (e.clientY - startY) / scale;
            setWebviewPosition({
                x: webviewPosition.x + deltaX,
                y: webviewPosition.y + deltaY,
            });
        };
        const stopMove = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', stopMove);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', stopMove);
    }
    function getSelectedOutlineColor() {
        if (editorEngine.mode === models_1.EditorMode.PREVIEW) {
            return 'outline-blue-400';
        }
        if (domState === webview_1.WebviewState.DOM_ONLOOK_ENABLED) {
            return 'outline-teal-400';
        }
        if (domState === webview_1.WebviewState.DOM_NO_ONLOOK) {
            return 'outline-amber-400';
        }
        if (domState === webview_1.WebviewState.NOT_RUNNING && editorEngine.mode === models_1.EditorMode.DESIGN) {
            return 'outline-foreground-secondary';
        }
        return 'outline-transparent';
    }
    function renderNotRunning() {
        return (<>
                    {projectsManager.runner?.state === run_1.RunState.RUNNING ? (<shine_border_1.ShineBorder className="w-full absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-gray-800/40 via-gray-500/40 to-gray-400/40 border-gray-500 border-[0.5px] space-y-10 rounded-xl" color={[
                    'var(--color-teal-300)',
                    'var(--color-blue-400)',
                    'var(--color-purple-200)',
                ]} autoShine={true}>
                            <framer_motion_1.motion.p className="text-active text-title1 text-center text-balance pb-24" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                                {t('editor.frame.waitingForApp')}
                            </framer_motion_1.motion.p>
                        </shine_border_1.ShineBorder>) : (<div className="w-full absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-gray-800/40 via-gray-500/40 to-gray-400/40 border-gray-500 border-[0.5px] space-y-10 rounded-xl">
                            <p className="text-active text-title1 text-center text-balance">
                                {t('editor.frame.startDesigning.prefix')}
                                <span className="text-teal-600 dark:text-teal-300">
                                    {t('editor.frame.startDesigning.action')}
                                </span>
                                {t('editor.frame.startDesigning.suffix')}
                            </p>
                            <button_1.Button className={(0, utils_1.cn)('h-14 overflow-hidden', 'text-teal-700 dark:text-teal-100 relative border-teal-700 dark:border-teal-400 hover:border-teal-500 dark:hover:border-teal-200 hover:shadow-xl shadow-2xl shadow-teal-700/50 dark:shadow-teal-400/50 hover:shadow-teal-500/50 dark:hover:shadow-teal-200/50 transition-all duration-300', 'before:absolute before:inset-0 before:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,theme(colors.teal.200/80)_0%,theme(colors.teal.300/80)_100%)] dark:before:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,theme(colors.teal.800/80)_0%,theme(colors.teal.500/80)_100%)]', 'after:absolute after:inset-0 after:bg-[radial-gradient(169.40%_89.55%_at_90%_10%,theme(colors.teal.300/50)_0%,theme(colors.teal.200/50)_100%)] dark:after:bg-[radial-gradient(169.40%_89.55%_at_90%_10%,theme(colors.teal.500/50)_0%,theme(colors.teal.400/50)_100%)]', 'after:opacity-0 hover:after:opacity-100', 'before:transition-all after:transition-all before:duration-300 after:duration-300', 'before:z-0 after:z-0')} onClick={() => {
                    projectsManager.runner?.start();
                }}>
                                <span className="relative z-10 flex items-center gap-x-1.5 px-3 py-2.5">
                                    <icons_1.Icons.Play className="w-8 h-8"/>
                                    <span className="text-title3">
                                        {t('editor.frame.playButton')}
                                    </span>
                                </span>
                            </button_1.Button>
                        </div>)}
                </>);
    }
    return (<div className="flex flex-col fixed" style={{ transform: `translate(${webviewPosition.x}px, ${webviewPosition.y}px)` }}>
                <BrowserControl_1.default webviewRef={domReady ? webviewRef : null} webviewSrc={webviewSrc} setWebviewSrc={setWebviewSrc} selected={selected} hovered={hovered} setHovered={setHovered} setDarkmode={setDarkmode} settings={settings} startMove={startMove} domState={domState} webviewSize={webviewSize}/>
                <div className="relative">
                    <ResizeHandles_1.default webviewRef={webviewRef} webviewSize={webviewSize} setWebviewSize={setWebviewSize} selectedPreset={selectedPreset} setSelectedPreset={setSelectedPreset} lockedPreset={lockedPreset} setLockedPreset={setLockedPreset} setIsResizing={setIsResizing} aspectRatioLocked={aspectRatioLocked || constants_1.DefaultSettings.ASPECT_RATIO_LOCKED} webviewId={settings.id}/>
                    <webview id={settings.id} ref={webviewRef} className={(0, utils_1.cn)('w-[96rem] h-[60rem] backdrop-blur-sm transition outline outline-4', shouldShowDomFailed ? 'bg-transparent' : 'bg-white', selected ? getSelectedOutlineColor() : 'outline-transparent')} src={settings.url} preload={`file://${window.env.WEBVIEW_PRELOAD_PATH}`} allowpopups={'true'} style={{
            width: clampedDimensions.width,
            height: clampedDimensions.height,
        }}></webview>
                    <GestureScreen_1.default isResizing={isResizing} webviewRef={webviewRef} setHovered={setHovered}/>
                    {domFailed && shouldShowDomFailed && renderNotRunning()}
                </div>
            </div>);
});
exports.default = Frame;
//# sourceMappingURL=Frame.js.map