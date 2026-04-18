"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMetadataForm = void 0;
const react_1 = require("react");
const extractTitleFromMetadata = (title, fallback) => {
    if (!title) {
        return { default: fallback };
    }
    if (typeof title === 'string') {
        return { default: title };
    }
    return title;
};
const createTitleString = (titleObj) => {
    return titleObj.absolute || titleObj.default || titleObj.template || '';
};
const useMetadataForm = ({ initialMetadata, defaultTitle = 'Title', defaultDescription = 'This is the information that will show up on search engines below your page title.', }) => {
    const initialTitle = (0, react_1.useMemo)(() => initialMetadata?.title, [initialMetadata?.title]);
    const initialDesc = (0, react_1.useMemo)(() => initialMetadata?.description, [initialMetadata?.description]);
    const initialTitleObj = (0, react_1.useMemo)(() => extractTitleFromMetadata(initialTitle, defaultTitle), [initialTitle, defaultTitle]);
    const isSimpleTitle = typeof initialTitle === 'string' || !initialTitle;
    const [titleObject, setTitleObject] = (0, react_1.useState)(initialTitleObj);
    const [description, setDescription] = (0, react_1.useState)(initialDesc ?? defaultDescription);
    const [isDirty, setIsDirty] = (0, react_1.useState)(false);
    const [uploadedImage, setUploadedImage] = (0, react_1.useState)(null);
    const title = createTitleString(titleObject);
    const handleTitleChange = (e) => {
        const newValue = e.target.value;
        setTitleObject(prev => ({ ...prev, default: newValue }));
        setIsDirty(true);
    };
    const handleTitleTemplateChange = (e) => {
        const newValue = e.target.value;
        setTitleObject(prev => ({ ...prev, template: newValue }));
        setIsDirty(true);
    };
    const handleTitleAbsoluteChange = (e) => {
        const newValue = e.target.value;
        setTitleObject(prev => ({ ...prev, absolute: newValue }));
        setIsDirty(true);
    };
    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
        setIsDirty(true);
    };
    const handleImageSelect = (file) => {
        setUploadedImage(file);
        setIsDirty(true);
    };
    const handleDiscard = () => {
        setTitleObject(initialTitleObj);
        setDescription(initialDesc ?? defaultDescription);
        setUploadedImage(null);
        setIsDirty(false);
    };
    (0, react_1.useEffect)(() => {
        setTitleObject(initialTitleObj);
        setDescription(initialDesc ?? defaultDescription);
    }, [initialTitleObj, initialDesc, defaultDescription]);
    const getFinalTitleMetadata = () => {
        if (isSimpleTitle) {
            return titleObject.default || '';
        }
        if (titleObject.default && !titleObject.template && !titleObject.absolute) {
            return titleObject.default;
        }
        if (titleObject.template || titleObject.absolute) {
            return titleObject;
        }
        return titleObject.default || '';
    };
    return {
        title,
        titleObject,
        description,
        isDirty,
        uploadedImage,
        isSimpleTitle,
        handleTitleChange,
        handleTitleTemplateChange,
        handleTitleAbsoluteChange,
        handleDescriptionChange,
        handleImageSelect,
        handleDiscard,
        setTitle: (value) => {
            setTitleObject(prev => ({ ...prev, default: value }));
        },
        setDescription,
        setIsDirty,
        getFinalTitleMetadata,
    };
};
exports.useMetadataForm = useMetadataForm;
//# sourceMappingURL=use-metadata-form.js.map