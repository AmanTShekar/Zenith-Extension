"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePanelMeasurements = void 0;
const react_1 = require("react");
const usePanelMeasurements = (leftPanelRef, rightPanelRef) => {
    const [toolbarLeft, setToolbarLeft] = (0, react_1.useState)(0);
    const [toolbarRight, setToolbarRight] = (0, react_1.useState)(0);
    const [editorBarAvailableWidth, setEditorBarAvailableWidth] = (0, react_1.useState)(0);
    // Use refs to store current values to avoid effect re-initialization
    const toolbarLeftRef = (0, react_1.useRef)(0);
    const toolbarRightRef = (0, react_1.useRef)(0);
    const measure = (0, react_1.useCallback)(() => {
        const left = leftPanelRef.current?.getBoundingClientRect().right ?? 0;
        const right = window.innerWidth -
            (rightPanelRef.current?.getBoundingClientRect().left ?? window.innerWidth);
        // Update refs immediately
        toolbarLeftRef.current = left;
        toolbarRightRef.current = right;
        // Update state to trigger re-renders
        setToolbarLeft(left);
        setToolbarRight(right);
        setEditorBarAvailableWidth(window.innerWidth - left - right);
    }, [leftPanelRef, rightPanelRef]);
    (0, react_1.useEffect)(() => {
        // Initial measurement
        measure();
        // Measure after DOM paint
        const rafId = requestAnimationFrame(measure);
        // Window resize listener
        const handleResize = () => measure();
        window.addEventListener('resize', handleResize);
        // ResizeObservers for panels - observe both the panels and their children
        const observers = [];
        const createObserver = (element) => {
            const observer = new ResizeObserver(() => {
                // Use requestAnimationFrame to debounce rapid changes
                requestAnimationFrame(measure);
            });
            observer.observe(element);
            // Also observe all child elements that might affect width
            const children = element.querySelectorAll('*');
            children.forEach(child => {
                if (child instanceof HTMLElement) {
                    observer.observe(child);
                }
            });
            return observer;
        };
        if (leftPanelRef.current) {
            const leftObserver = createObserver(leftPanelRef.current);
            observers.push(leftObserver);
        }
        if (rightPanelRef.current) {
            const rightObserver = createObserver(rightPanelRef.current);
            observers.push(rightObserver);
        }
        // Polling fallback to catch any missed changes
        const pollInterval = setInterval(() => {
            const currentLeft = leftPanelRef.current?.getBoundingClientRect().right ?? 0;
            const currentRight = window.innerWidth - (rightPanelRef.current?.getBoundingClientRect().left ?? window.innerWidth);
            // Use refs for comparison to avoid dependency on state values
            if (Math.abs(currentLeft - toolbarLeftRef.current) > 1 || Math.abs(currentRight - toolbarRightRef.current) > 1) {
                measure();
            }
        }, 100);
        // MutationObserver to detect DOM changes that might affect panel width
        const mutationObservers = [];
        const createMutationObserver = (element) => {
            const observer = new MutationObserver(() => {
                requestAnimationFrame(measure);
            });
            observer.observe(element, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style', 'width']
            });
            return observer;
        };
        if (leftPanelRef.current) {
            mutationObservers.push(createMutationObserver(leftPanelRef.current));
        }
        if (rightPanelRef.current) {
            mutationObservers.push(createMutationObserver(rightPanelRef.current));
        }
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', handleResize);
            observers.forEach(observer => observer.disconnect());
            mutationObservers.forEach(observer => observer.disconnect());
            clearInterval(pollInterval);
        };
    }, [measure]); // Only depend on measure callback, not the state values
    return { toolbarLeft, toolbarRight, editorBarAvailableWidth };
};
exports.usePanelMeasurements = usePanelMeasurements;
//# sourceMappingURL=use-panel-measure.js.map