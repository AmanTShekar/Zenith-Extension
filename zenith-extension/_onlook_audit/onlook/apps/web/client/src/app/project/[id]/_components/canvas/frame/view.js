"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameComponent = void 0;
const react_1 = require("react");
const mobx_react_lite_1 = require("mobx-react-lite");
const penpal_1 = require("penpal");
const penpal_2 = require("@onlook/penpal");
const ai_elements_1 = require("@onlook/ui/ai-elements");
const utils_1 = require("@onlook/ui/utils");
const editor_1 = require("@/components/store/editor");
// Creates a proxy that provides safe fallback methods for any property access
const createSafeFallbackMethods = () => {
    return new Proxy({}, {
        get(_target, prop) {
            if (typeof prop === 'symbol')
                return undefined;
            return async (..._args) => {
                const method = String(prop);
                if (method.startsWith('get') ||
                    method.includes('capture') ||
                    method.includes('build')) {
                    return null;
                }
                if (method.includes('Count')) {
                    return 0;
                }
                if (method.includes('Editable') || method.includes('supports')) {
                    return false;
                }
                return undefined;
            };
        },
    });
};
exports.FrameComponent = (0, mobx_react_lite_1.observer)((0, react_1.forwardRef)(({ frame, reloadIframe, onConnectionFailed, onConnectionSuccess, penpalTimeoutMs = 5000, isInDragSelection = false, ...restProps }, ref) => {
    const { popover, ...props } = restProps;
    const editorEngine = (0, editor_1.useEditorEngine)();
    const iframeRef = (0, react_1.useRef)(null);
    const zoomLevel = (0, react_1.useRef)(1);
    const isConnecting = (0, react_1.useRef)(false);
    const connectionRef = (0, react_1.useRef)(null);
    const [penpalChild, setPenpalChild] = (0, react_1.useState)(null);
    const isSelected = editorEngine.frames.isSelected(frame.id);
    const isActiveBranch = editorEngine.branches.activeBranch.id === frame.branchId;
    const setupPenpalConnection = () => {
        try {
            if (!iframeRef.current?.contentWindow) {
                console.error(`${penpal_2.PENPAL_PARENT_CHANNEL} (${frame.id}) - No iframe found`);
                onConnectionFailed();
                return;
            }
            if (isConnecting.current) {
                console.log(`${penpal_2.PENPAL_PARENT_CHANNEL} (${frame.id}) - Connection already in progress`);
                return;
            }
            isConnecting.current = true;
            // Destroy any existing connection
            if (connectionRef.current) {
                connectionRef.current.destroy();
                connectionRef.current = null;
            }
            const messenger = new penpal_1.WindowMessenger({
                remoteWindow: iframeRef.current.contentWindow,
                allowedOrigins: ['*'],
            });
            const connection = (0, penpal_1.connect)({
                messenger,
                methods: {
                    getFrameId: () => frame.id,
                    getBranchId: () => frame.branchId,
                    onWindowMutated: () => {
                        editorEngine.frameEvent.handleWindowMutated();
                    },
                    onWindowResized: () => {
                        editorEngine.frameEvent.handleWindowResized();
                    },
                    onDomProcessed: (data) => {
                        editorEngine.frameEvent.handleDomProcessed(frame.id, data);
                    },
                },
            });
            connectionRef.current = connection;
            // Create a timeout promise that rejects after specified timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Penpal connection timeout after ${penpalTimeoutMs}ms`));
                }, penpalTimeoutMs);
            });
            // Race the connection promise against the timeout
            Promise.race([connection.promise, timeoutPromise])
                .then((child) => {
                isConnecting.current = false;
                if (!child) {
                    console.error(`${penpal_2.PENPAL_PARENT_CHANNEL} (${frame.id}) - Connection failed: child is null`);
                    onConnectionFailed();
                    return;
                }
                console.log(`${penpal_2.PENPAL_PARENT_CHANNEL} (${frame.id}) - Penpal connection set`);
                const remote = child;
                setPenpalChild(remote);
                remote.setFrameId(frame.id);
                remote.setBranchId(frame.branchId);
                remote.handleBodyReady();
                remote.processDom();
                // Notify parent of successful connection
                onConnectionSuccess();
            })
                .catch((error) => {
                isConnecting.current = false;
                console.error(`${penpal_2.PENPAL_PARENT_CHANNEL} (${frame.id}) - Failed to setup penpal connection:`, error);
                onConnectionFailed();
            });
        }
        catch (error) {
            isConnecting.current = false;
            console.error(`${penpal_2.PENPAL_PARENT_CHANNEL} (${frame.id}) - Setup failed:`, error);
            onConnectionFailed();
        }
    };
    const promisifyMethod = (method) => {
        return async (...args) => {
            try {
                if (!method)
                    throw new Error('Method not initialized');
                return method(...args);
            }
            catch (error) {
                console.error(`${penpal_2.PENPAL_PARENT_CHANNEL} (${frame.id}) - Method failed:`, error);
            }
        };
    };
    const remoteMethods = (0, react_1.useMemo)(() => {
        if (!penpalChild) {
            return createSafeFallbackMethods();
        }
        return {
            processDom: promisifyMethod(penpalChild?.processDom),
            getElementAtLoc: promisifyMethod(penpalChild?.getElementAtLoc),
            getElementByDomId: promisifyMethod(penpalChild?.getElementByDomId),
            setFrameId: promisifyMethod(penpalChild?.setFrameId),
            setBranchId: promisifyMethod(penpalChild?.setBranchId),
            getElementIndex: promisifyMethod(penpalChild?.getElementIndex),
            getComputedStyleByDomId: promisifyMethod(penpalChild?.getComputedStyleByDomId),
            updateElementInstance: promisifyMethod(penpalChild?.updateElementInstance),
            getFirstOnlookElement: promisifyMethod(penpalChild?.getFirstOnlookElement),
            setElementType: promisifyMethod(penpalChild?.setElementType),
            getElementType: promisifyMethod(penpalChild?.getElementType),
            getParentElement: promisifyMethod(penpalChild?.getParentElement),
            getChildrenCount: promisifyMethod(penpalChild?.getChildrenCount),
            getOffsetParent: promisifyMethod(penpalChild?.getOffsetParent),
            getActionLocation: promisifyMethod(penpalChild?.getActionLocation),
            getActionElement: promisifyMethod(penpalChild?.getActionElement),
            getInsertLocation: promisifyMethod(penpalChild?.getInsertLocation),
            getRemoveAction: promisifyMethod(penpalChild?.getRemoveAction),
            getTheme: promisifyMethod(penpalChild?.getTheme),
            setTheme: promisifyMethod(penpalChild?.setTheme),
            startDrag: promisifyMethod(penpalChild?.startDrag),
            drag: promisifyMethod(penpalChild?.drag),
            dragAbsolute: promisifyMethod(penpalChild?.dragAbsolute),
            endDragAbsolute: promisifyMethod(penpalChild?.endDragAbsolute),
            endDrag: promisifyMethod(penpalChild?.endDrag),
            endAllDrag: promisifyMethod(penpalChild?.endAllDrag),
            startEditingText: promisifyMethod(penpalChild?.startEditingText),
            editText: promisifyMethod(penpalChild?.editText),
            stopEditingText: promisifyMethod(penpalChild?.stopEditingText),
            updateStyle: promisifyMethod(penpalChild?.updateStyle),
            insertElement: promisifyMethod(penpalChild?.insertElement),
            removeElement: promisifyMethod(penpalChild?.removeElement),
            moveElement: promisifyMethod(penpalChild?.moveElement),
            groupElements: promisifyMethod(penpalChild?.groupElements),
            ungroupElements: promisifyMethod(penpalChild?.ungroupElements),
            insertImage: promisifyMethod(penpalChild?.insertImage),
            removeImage: promisifyMethod(penpalChild?.removeImage),
            isChildTextEditable: promisifyMethod(penpalChild?.isChildTextEditable),
            handleBodyReady: promisifyMethod(penpalChild?.handleBodyReady),
            captureScreenshot: promisifyMethod(penpalChild?.captureScreenshot),
            buildLayerTree: promisifyMethod(penpalChild?.buildLayerTree),
        };
    }, [penpalChild]);
    (0, react_1.useImperativeHandle)(ref, () => {
        const iframe = iframeRef.current;
        if (!iframe) {
            console.error(`${penpal_2.PENPAL_PARENT_CHANNEL} (${frame.id}) - Iframe - Not found`);
            // Return safe fallback with no-op methods and safe defaults
            const fallbackElement = document.createElement('iframe');
            const safeFallback = Object.assign(fallbackElement, {
                // Custom sync methods with safe no-op implementations
                supportsOpenDevTools: () => false,
                setZoomLevel: () => { },
                reload: () => { },
                isLoading: () => false,
                // Reuse the safe fallback methods from remoteMethods
                ...remoteMethods,
            });
            return safeFallback;
        }
        // Register the iframe with the editor engine
        editorEngine.frames.registerView(frame, iframe);
        const syncMethods = {
            supportsOpenDevTools: () => !!iframe.contentWindow && 'openDevTools' in iframe.contentWindow,
            setZoomLevel: (level) => {
                zoomLevel.current = level;
                iframe.style.transform = `scale(${level})`;
                iframe.style.transformOrigin = 'top left';
            },
            reload: () => reloadIframe(),
            isLoading: () => iframe.contentDocument?.readyState !== 'complete',
        };
        if (!penpalChild) {
            console.warn(`${penpal_2.PENPAL_PARENT_CHANNEL} (${frame.id}) - Failed to setup penpal connection: iframeRemote is null`);
            return Object.assign(iframe, syncMethods, remoteMethods);
        }
        return Object.assign(iframe, {
            ...syncMethods,
            ...remoteMethods,
        });
    }, [penpalChild, frame, iframeRef]);
    (0, react_1.useEffect)(() => {
        return () => {
            if (connectionRef.current) {
                connectionRef.current.destroy();
                connectionRef.current = null;
            }
            setPenpalChild(null);
            isConnecting.current = false;
        };
    }, []);
    return (<ai_elements_1.WebPreview>
                    <ai_elements_1.WebPreviewBody ref={iframeRef} id={frame.id} className={(0, utils_1.cn)('outline outline-4 backdrop-blur-sm transition', isActiveBranch && 'outline-teal-400', isActiveBranch && !isSelected && 'outline-dashed', !isActiveBranch && isInDragSelection && 'outline-teal-500')} src={frame.url} sandbox="allow-modals allow-forms allow-same-origin allow-scripts allow-popups allow-downloads" allow="geolocation; microphone; camera; midi; encrypted-media" style={{ width: frame.dimension.width, height: frame.dimension.height }} onLoad={setupPenpalConnection} {...props}/>
                </ai_elements_1.WebPreview>);
}));
//# sourceMappingURL=view.js.map