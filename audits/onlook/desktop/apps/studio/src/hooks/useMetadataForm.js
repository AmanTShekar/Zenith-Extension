"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMetadataForm = void 0;
const react_1 = require("react");
const useMetadataForm = ({ initialMetadata, defaultTitle = 'Title', defaultDescription = 'This is the information that will show up on search engines below your page title.', }) => {
    const [title, setTitle] = (0, react_1.useState)(initialMetadata?.title ?? defaultTitle);
    const [description, setDescription] = (0, react_1.useState)(initialMetadata?.description ?? defaultDescription);
    const [isDirty, setIsDirty] = (0, react_1.useState)(false);
    const [uploadedImage, setUploadedImage] = (0, react_1.useState)(null);
    const handleTitleChange = (e) => {
        setTitle(e.target.value);
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
        setTitle(initialMetadata?.title ?? defaultTitle);
        setDescription(initialMetadata?.description ?? defaultDescription);
        setUploadedImage(null);
        setIsDirty(false);
    };
    (0, react_1.useEffect)(() => {
        setTitle(initialMetadata?.title ?? defaultTitle);
        setDescription(initialMetadata?.description ?? defaultDescription);
    }, [initialMetadata, defaultTitle, defaultDescription]);
    return {
        title,
        description,
        isDirty,
        uploadedImage,
        handleTitleChange,
        handleDescriptionChange,
        handleImageSelect,
        handleDiscard,
        setTitle,
        setDescription,
        setIsDirty,
    };
};
exports.useMetadataForm = useMetadataForm;
//# sourceMappingURL=useMetadataForm.js.map