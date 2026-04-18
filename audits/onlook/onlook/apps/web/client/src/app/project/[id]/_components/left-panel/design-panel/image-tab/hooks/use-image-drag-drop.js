"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useImageDragDrop = void 0;
const editor_1 = require("@/components/store/editor");
const models_1 = require("@onlook/models");
const react_1 = require("posthog-js/react");
const react_2 = require("react");
const useImageDragDrop = (onUpload) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const posthog = (0, react_1.usePostHog)();
    const [isDragging, setIsDragging] = (0, react_2.useState)(false);
    const handleDragOver = (0, react_2.useCallback)((e) => {
        e.preventDefault();
    }, []);
    const handleDragEnter = (0, react_2.useCallback)((e) => {
        e.preventDefault();
        handleDragStateChange(true, e);
    }, []);
    const handleDragLeave = (0, react_2.useCallback)((e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget)) {
            handleDragStateChange(false, e);
        }
    }, []);
    const handleDragStateChange = (0, react_2.useCallback)((isDragging, e) => {
        const hasImage = e.dataTransfer.types.length > 0 &&
            Array.from(e.dataTransfer.items).some((item) => item.type.startsWith('image/') ||
                (item.type === 'Files' && e.dataTransfer.types.includes('public.file-url')));
        if (hasImage) {
            setIsDragging(isDragging);
            e.currentTarget.setAttribute('data-dragging-image', isDragging.toString());
        }
    }, []);
    const onImageDragStart = (0, react_2.useCallback)((e, image) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'image',
            fileName: image.fileName,
            content: image.content,
            mimeType: image.mimeType,
            originPath: image.originPath,
        }));
        editorEngine.state.insertMode = models_1.InsertMode.INSERT_IMAGE;
        for (const frame of editorEngine.frames.getAll()) {
            if (!frame.view) {
                console.error('No frame view found');
                continue;
            }
            frame.view.style.pointerEvents = 'none';
        }
        posthog.capture('image_drag_start');
    }, []);
    const onImageMouseDown = (0, react_2.useCallback)(() => {
        editorEngine.state.insertMode = models_1.InsertMode.INSERT_IMAGE;
    }, [editorEngine.state]);
    const onImageMouseUp = (0, react_2.useCallback)(() => {
        editorEngine.state.editorMode = models_1.EditorMode.DESIGN;
        editorEngine.state.insertMode = null;
    }, [editorEngine.state]);
    const onImageDragEnd = (0, react_2.useCallback)(() => {
        for (const frame of editorEngine.frames.getAll()) {
            if (!frame.view) {
                console.error('No frame view found');
                continue;
            }
            frame.view.style.pointerEvents = 'auto';
        }
        editorEngine.state.editorMode = models_1.EditorMode.DESIGN;
    }, []);
    const handleDrop = (0, react_2.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(false);
        e.currentTarget.removeAttribute('data-dragging-image');
        const files = e.dataTransfer.files;
        if (files.length > 0 && onUpload) {
            void onUpload(files);
        }
    }, [onUpload]);
    return {
        isDragging,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        handleDrop,
        onImageDragStart,
        onImageMouseDown,
        onImageMouseUp,
        onImageDragEnd,
    };
};
exports.useImageDragDrop = useImageDragDrop;
//# sourceMappingURL=use-image-drag-drop.js.map