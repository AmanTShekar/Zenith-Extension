"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChat = useChat;
const editor_1 = require("@/components/store/editor");
const tools_1 = require("@/components/tools");
const client_1 = require("@/trpc/client");
const react_1 = require("@ai-sdk/react");
const models_1 = require("@onlook/models");
const utility_1 = require("@onlook/utility");
const ai_1 = require("ai");
const react_2 = require("posthog-js/react");
const react_3 = require("react");
const uuid_1 = require("uuid");
const utils_1 = require("./utils");
function useChat({ conversationId, projectId, initialMessages }) {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const posthog = (0, react_2.usePostHog)();
    const [finishReason, setFinishReason] = (0, react_3.useState)(null);
    const [isExecutingToolCall, setIsExecutingToolCall] = (0, react_3.useState)(false);
    const [queuedMessages, setQueuedMessages] = (0, react_3.useState)([]);
    const isProcessingQueue = (0, react_3.useRef)(false);
    const { addToolResult, messages, error, stop, setMessages, regenerate, status } = (0, react_1.useChat)({
        id: 'user-chat',
        messages: initialMessages,
        sendAutomaticallyWhen: ai_1.lastAssistantMessageIsCompleteWithToolCalls,
        transport: new ai_1.DefaultChatTransport({
            api: '/api/chat',
            body: {
                conversationId,
                projectId,
            },
        }),
        onToolCall: async (toolCall) => {
            setIsExecutingToolCall(true);
            void (0, tools_1.handleToolCall)(toolCall.toolCall, editorEngine, addToolResult).then(() => {
                setIsExecutingToolCall(false);
            });
        },
        onFinish: ({ message }) => {
            const finishReason = message.metadata?.finishReason;
            setFinishReason(finishReason ?? null);
        },
    });
    const isStreaming = status === 'streaming' || status === 'submitted' || isExecutingToolCall;
    (0, react_3.useEffect)(() => {
        editorEngine.chat.setIsStreaming(isStreaming);
    }, [editorEngine.chat, isStreaming]);
    // Store messages in a ref to avoid re-rendering sendMessage/editMessage
    const messagesRef = (0, react_3.useRef)(messages);
    (0, react_3.useEffect)(() => {
        messagesRef.current = messages;
    }, [messages]);
    const processMessage = (0, react_3.useCallback)(async (content, type, context) => {
        const messageContext = context || await editorEngine.chat.context.getContextByChatType(type);
        const newMessage = (0, utils_1.getUserChatMessageFromString)(content, messageContext, conversationId);
        setMessages((0, utility_1.jsonClone)([...messagesRef.current, newMessage]));
        void regenerate({
            body: {
                chatType: type,
                conversationId,
                context: messageContext,
            },
        });
        void editorEngine.chat.conversation.generateTitle(content);
        return newMessage;
    }, [
        editorEngine.chat.context,
        messagesRef,
        setMessages,
        regenerate,
        conversationId,
    ]);
    const sendMessage = (0, react_3.useCallback)(async (content, type) => {
        posthog.capture('user_send_message', { type });
        const context = await editorEngine.chat.context.getContextByChatType(type);
        const newMessage = {
            id: (0, uuid_1.v4)(),
            content,
            type,
            timestamp: new Date(),
            context
        };
        if (isStreaming) {
            // AI is running - add to bottom of queue (normal queueing)
            setQueuedMessages(prev => [...prev, newMessage]);
        }
        else if (queuedMessages.length > 0) {
            // AI is stopped but there are queued messages - add to top of queue (priority)
            setQueuedMessages(prev => [newMessage, ...prev]);
        }
        else {
            // No queue and not streaming - send immediately
            return processMessage(content, type);
        }
        return (0, utils_1.getUserChatMessageFromString)(content, [], conversationId);
    }, [processMessage, posthog, editorEngine.chat.context, isStreaming, queuedMessages.length, conversationId]);
    const processMessageEdit = (0, react_3.useCallback)(async (messageId, newContent, chatType) => {
        const messageIndex = messagesRef.current.findIndex((m) => m.id === messageId);
        const message = messagesRef.current[messageIndex];
        if (messageIndex === -1 || !message || message.role !== 'user') {
            throw new Error('Message not found.');
        }
        const updatedMessages = messagesRef.current.slice(0, messageIndex);
        // For resubmitted messages, we want to keep the previous context and refresh if possible
        const previousContext = message.metadata?.context ?? [];
        const updatedContext = await editorEngine.chat.context.getRefreshedContext(previousContext);
        message.metadata = {
            ...message.metadata,
            context: updatedContext,
            conversationId,
            createdAt: message.metadata?.createdAt ?? new Date(),
            checkpoints: message.metadata?.checkpoints ?? [],
        };
        message.parts = [{ type: 'text', text: newContent }];
        setMessages((0, utility_1.jsonClone)([...updatedMessages, message]));
        void regenerate({
            body: {
                chatType,
                conversationId,
            },
        });
        return message;
    }, [
        editorEngine.chat.context,
        regenerate,
        conversationId,
        setMessages,
    ]);
    const removeFromQueue = (0, react_3.useCallback)((id) => {
        setQueuedMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);
    const processNextInQueue = (0, react_3.useCallback)(async () => {
        if (isProcessingQueue.current || isStreaming || queuedMessages.length === 0)
            return;
        const nextMessage = queuedMessages[0];
        if (!nextMessage)
            return;
        isProcessingQueue.current = true;
        try {
            const refreshedContext = await editorEngine.chat.context.getRefreshedContext(nextMessage.context);
            await processMessage(nextMessage.content, nextMessage.type, refreshedContext);
            // Remove only after successful processing
            setQueuedMessages(prev => prev.slice(1));
        }
        catch (error) {
            console.error('Failed to process queued message:', error);
        }
        finally {
            isProcessingQueue.current = false;
        }
    }, [queuedMessages, editorEngine.chat.context, processMessage, isStreaming]);
    const editMessage = (0, react_3.useCallback)(async (messageId, newContent, chatType) => {
        posthog.capture('user_edit_message', { type: models_1.ChatType.EDIT });
        if (isStreaming) {
            // Stop current streaming immediately
            stop();
            // Process edit with immediate priority (higher than queue)
            const context = await editorEngine.chat.context.getContextByChatType(chatType);
            return await processMessageEdit(messageId, newContent, chatType);
        }
        // Normal edit processing when not streaming
        return processMessageEdit(messageId, newContent, chatType);
    }, [processMessageEdit, posthog, isStreaming, stop, editorEngine.chat.context]);
    (0, react_3.useEffect)(() => {
        // Actions to handle when the chat is finished
        if (finishReason && finishReason !== 'tool-calls') {
            setFinishReason(null);
            const applyCommit = async () => {
                const lastUserMessage = messagesRef.current.findLast((m) => m.role === 'user');
                if (!lastUserMessage) {
                    return;
                }
                const content = lastUserMessage.parts
                    .map((p) => {
                    if (p.type === 'text') {
                        return p.text;
                    }
                    return '';
                })
                    .join('');
                if (!content) {
                    return;
                }
                // Create checkpoints for all branches
                const checkpoints = await (0, utils_1.createCheckpointsForAllBranches)(editorEngine, content);
                if (checkpoints.length === 0) {
                    return;
                }
                // Update message with all checkpoints
                const oldCheckpoints = lastUserMessage.metadata?.checkpoints.map((checkpoint) => ({
                    ...checkpoint,
                    createdAt: new Date(checkpoint.createdAt),
                })) ?? [];
                lastUserMessage.metadata = {
                    ...lastUserMessage.metadata,
                    createdAt: lastUserMessage.metadata?.createdAt ?? new Date(),
                    conversationId,
                    checkpoints: [...oldCheckpoints, ...checkpoints],
                    context: lastUserMessage.metadata?.context ?? [],
                };
                // Save checkpoints to database (filter out legacy checkpoints without branchId)
                const checkpointsWithBranchId = [...oldCheckpoints, ...checkpoints].filter((cp) => !!cp.branchId);
                void client_1.api.chat.message.updateCheckpoints.mutate({
                    messageId: lastUserMessage.id,
                    checkpoints: checkpointsWithBranchId,
                });
                setMessages((0, utility_1.jsonClone)(messagesRef.current.map((m) => m.id === lastUserMessage.id ? lastUserMessage : m)));
            };
            const cleanupContext = async () => {
                await editorEngine.chat.context.clearImagesFromContext();
            };
            const processNextQueuedMessage = async () => {
                if (finishReason !== 'stop') {
                    return;
                }
                if (queuedMessages.length > 0) {
                    setTimeout(processNextInQueue, 500);
                }
            };
            void cleanupContext();
            void applyCommit();
            void processNextQueuedMessage();
        }
    }, [finishReason, conversationId, queuedMessages.length, processNextInQueue]);
    (0, react_3.useEffect)(() => {
        editorEngine.chat.conversation.setConversationLength(messages.length);
    }, [messages.length, editorEngine.chat.conversation]);
    (0, react_3.useEffect)(() => {
        editorEngine.chat.setChatActions(sendMessage);
    }, [editorEngine.chat, sendMessage]);
    return {
        status,
        sendMessage,
        editMessage,
        messages,
        error,
        stop,
        isStreaming,
        queuedMessages,
        removeFromQueue,
    };
}
//# sourceMappingURL=index.js.map