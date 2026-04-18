"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStartProject = void 0;
const editor_1 = require("@/components/store/editor");
const react_1 = require("@/trpc/react");
const models_1 = require("@onlook/models");
const sonner_1 = require("@onlook/ui/sonner");
const react_2 = require("react");
const use_tab_active_1 = require("../_hooks/use-tab-active");
const uuid_1 = require("uuid");
const useStartProject = () => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const sandbox = editorEngine.activeSandbox;
    const [error, setError] = (0, react_2.useState)(null);
    const processedRequestIdRef = (0, react_2.useRef)(null);
    const { tabState } = (0, use_tab_active_1.useTabActive)();
    const apiUtils = react_1.api.useUtils();
    const { data: user, error: userError } = react_1.api.user.get.useQuery();
    const { data: canvasWithFrames, error: canvasError } = react_1.api.userCanvas.getWithFrames.useQuery({ projectId: editorEngine.projectId });
    const { data: conversations, error: conversationsError } = react_1.api.chat.conversation.getAll.useQuery({ projectId: editorEngine.projectId });
    const { data: creationRequest, error: creationRequestError } = react_1.api.project.createRequest.getPendingRequest.useQuery({ projectId: editorEngine.projectId });
    const { mutateAsync: updateCreateRequest } = react_1.api.project.createRequest.updateStatus.useMutation({
        onSettled: async () => {
            await apiUtils.project.createRequest.getPendingRequest.invalidate({ projectId: editorEngine.projectId });
        },
    });
    const [projectReadyState, setProjectReadyState] = (0, react_2.useState)({
        canvas: false,
        conversations: false,
        sandbox: false,
    });
    const updateProjectReadyState = (state) => {
        setProjectReadyState((prev) => ({ ...prev, ...state }));
    };
    (0, react_2.useEffect)(() => {
        if (!sandbox.session.isConnecting) {
            updateProjectReadyState({ sandbox: true });
        }
    }, [sandbox.session.isConnecting]);
    (0, react_2.useEffect)(() => {
        if (tabState === 'reactivated') {
            sandbox.session.reconnect(editorEngine.projectId, user?.id);
        }
    }, [tabState, sandbox.session]);
    (0, react_2.useEffect)(() => {
        if (canvasWithFrames) {
            editorEngine.canvas.applyCanvas(canvasWithFrames.userCanvas);
            editorEngine.frames.applyFrames(canvasWithFrames.frames);
            updateProjectReadyState({ canvas: true });
        }
    }, [canvasWithFrames]);
    (0, react_2.useEffect)(() => {
        const applyConversations = async () => {
            if (conversations) {
                await editorEngine.chat.conversation.applyConversations(conversations);
                updateProjectReadyState({ conversations: true });
            }
        };
        void applyConversations();
    }, [editorEngine.chat.conversation, conversations]);
    (0, react_2.useEffect)(() => {
        const isProjectReady = Object.values(projectReadyState).every((value) => value);
        if (creationRequest && processedRequestIdRef.current !== creationRequest.id && isProjectReady && editorEngine.chat._sendMessageAction) {
            processedRequestIdRef.current = creationRequest.id;
            void resumeCreate(creationRequest);
        }
    }, [creationRequest, projectReadyState, editorEngine.chat._sendMessageAction]);
    const resumeCreate = async (creationData) => {
        try {
            if (editorEngine.projectId !== creationData.projectId) {
                throw new Error('Project ID mismatch');
            }
            const createContext = await editorEngine.chat.context.getCreateContext();
            const imageContexts = creationData.context
                .filter((context) => context.type === models_1.CreateRequestContextType.IMAGE)
                .map((context) => ({
                type: models_1.MessageContextType.IMAGE,
                source: 'external',
                content: context.content,
                mimeType: context.mimeType,
                displayName: 'user image',
                id: (0, uuid_1.v4)(),
            }));
            const context = [...createContext, ...imageContexts];
            editorEngine.chat.context.addContexts(context);
            const prompt = creationData.context
                .filter((context) => context.type === models_1.CreateRequestContextType.PROMPT)
                .map((context) => context.content)
                .join('\n');
            const [conversation] = await editorEngine.chat.conversation.getConversations(editorEngine.projectId);
            if (!conversation) {
                throw new Error('No conversation found');
            }
            await editorEngine.chat.conversation.selectConversation(conversation.id);
            await editorEngine.chat.sendMessage(prompt, models_1.ChatType.CREATE);
            try {
                await updateCreateRequest({
                    projectId: editorEngine.projectId,
                    status: models_1.ProjectCreateRequestStatus.COMPLETED,
                });
            }
            catch (error) {
                console.error('Failed to update create request', error);
                sonner_1.toast.error('Failed to complete create request', {
                    description: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        catch (error) {
            processedRequestIdRef.current = null; // Allow retry on failure
            console.error('Failed to resume create request', error);
            sonner_1.toast.error('Failed to resume create request', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
    (0, react_2.useEffect)(() => {
        setError(userError?.message ?? canvasError?.message ?? conversationsError?.message ?? creationRequestError?.message ?? null);
    }, [userError, canvasError, conversationsError, creationRequestError]);
    return { isProjectReady: Object.values(projectReadyState).every((value) => value), error };
};
exports.useStartProject = useStartProject;
//# sourceMappingURL=use-start-project.js.map