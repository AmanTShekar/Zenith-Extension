"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitChannels = exports.MainChannels = exports.WebviewChannels = void 0;
var WebviewChannels;
(function (WebviewChannels) {
    // To Webview
    WebviewChannels["WEBVIEW_ID"] = "webview-id";
    WebviewChannels["UPDATE_STYLE"] = "update-style";
    WebviewChannels["INSERT_ELEMENT"] = "insert-element";
    WebviewChannels["REMOVE_ELEMENT"] = "remove-element";
    WebviewChannels["MOVE_ELEMENT"] = "move-element";
    WebviewChannels["EDIT_ELEMENT_TEXT"] = "edit-element-text";
    WebviewChannels["CLEAN_AFTER_WRITE_TO_CODE"] = "clean-after-write";
    WebviewChannels["GROUP_ELEMENTS"] = "group-elements";
    WebviewChannels["UNGROUP_ELEMENTS"] = "ungroup-elements";
    WebviewChannels["UPDATE_ELEMENT_INSTANCE_ID"] = "update-element-instance-id";
    WebviewChannels["INSERT_IMAGE"] = "insert-image";
    WebviewChannels["REMOVE_IMAGE"] = "remove-image";
    // From Webview
    WebviewChannels["ELEMENT_INSERTED"] = "element-inserted";
    WebviewChannels["ELEMENT_REMOVED"] = "element-removed";
    WebviewChannels["ELEMENT_MOVED"] = "element-moved";
    WebviewChannels["ELEMENT_TEXT_EDITED"] = "element-text-edited";
    WebviewChannels["ELEMENT_GROUPED"] = "element-grouped";
    WebviewChannels["ELEMENT_UNGROUPED"] = "element-ungrouped";
    WebviewChannels["STYLE_UPDATED"] = "style-updated";
    WebviewChannels["WINDOW_RESIZED"] = "window-resized";
    WebviewChannels["WINDOW_MUTATED"] = "window-mutated";
    WebviewChannels["DOM_PROCESSED"] = "dom-processed";
    WebviewChannels["GET_WEBVIEW_ID"] = "get-webview-id";
})(WebviewChannels || (exports.WebviewChannels = WebviewChannels = {}));
var MainChannels;
(function (MainChannels) {
    MainChannels["RELOAD_APP"] = "reload-app";
    MainChannels["OPEN_IN_EXPLORER"] = "open-in-explorer";
    MainChannels["OPEN_EXTERNAL_WINDOW"] = "open-external-window";
    MainChannels["QUIT_AND_INSTALL"] = "quit-and-update-app";
    MainChannels["UPDATE_DOWNLOADED"] = "update-downloaded";
    MainChannels["UPDATE_NOT_AVAILABLE"] = "update-not-available";
    MainChannels["SAVE_IMAGE"] = "save-image";
    MainChannels["GET_IMAGE"] = "get-image";
    MainChannels["SEND_WINDOW_COMMAND"] = "send-window-command";
    MainChannels["DELETE_FOLDER"] = "delete-folder";
    MainChannels["IS_CHILD_TEXT_EDITABLE"] = "is-child-text-editable";
    MainChannels["IS_PORT_AVAILABLE"] = "is-port-available";
    MainChannels["CLEAN_UP_BEFORE_QUIT"] = "clean-up-before-quit";
    // Code
    MainChannels["GET_CODE_BLOCK"] = "get-code-block";
    MainChannels["GET_FILE_CONTENT"] = "get-file-content";
    MainChannels["GET_AND_WRITE_CODE_DIFFS"] = "get-and-write-code-diffs";
    MainChannels["WRITE_CODE_DIFFS"] = "write-code-diffs";
    MainChannels["VIEW_SOURCE_CODE"] = "view-source-code";
    MainChannels["VIEW_SOURCE_FILE"] = "view-source-file";
    MainChannels["VIEW_CODE_IN_ONLOOK"] = "view-code-in-onlook";
    MainChannels["PICK_COMPONENTS_DIRECTORY"] = "pick-directory";
    MainChannels["GET_COMPONENTS"] = "get-components";
    MainChannels["CLEAN_CODE_KEYS"] = "clean-move-keys";
    // Analytics
    MainChannels["UPDATE_ANALYTICS_PREFERENCE"] = "update-analytics-preference";
    MainChannels["SEND_ANALYTICS"] = "send-analytics";
    MainChannels["SEND_ANALYTICS_ERROR"] = "send-analytics-error";
    // Ast
    MainChannels["GET_TEMPLATE_NODE_AST"] = "get-template-node-ast";
    MainChannels["GET_TEMPLATE_NODE_CHILD"] = "get-template-node-child";
    MainChannels["GET_TEMPLATE_NODE_CLASS"] = "get-template-node-classes";
    MainChannels["GET_TEMPLATE_NODE_PROPS"] = "get-template-node-props";
    // Auth
    MainChannels["SIGN_IN"] = "sign-in";
    MainChannels["SIGN_OUT"] = "sign-out";
    MainChannels["USER_SIGNED_IN"] = "user-signed-in";
    MainChannels["USER_SIGNED_OUT"] = "user-signed-out";
    MainChannels["GET_USER_METADATA"] = "get-user-metadata";
    MainChannels["UPDATE_USER_METADATA"] = "update-user-metadata";
    MainChannels["IS_USER_SIGNED_IN"] = "is-user-signed-in";
    // Storage
    MainChannels["GET_USER_SETTINGS"] = "get-user-settings";
    MainChannels["GET_APP_STATE"] = "get-app-state";
    MainChannels["GET_PROJECTS"] = "get-projects";
    MainChannels["UPDATE_USER_SETTINGS"] = "update-user-settings";
    MainChannels["REPLACE_APP_STATE"] = "replace-app-state";
    MainChannels["UPDATE_PROJECTS"] = "update-projects";
    // Create
    MainChannels["GET_CREATE_PROJECT_PATH"] = "get-create-project-path";
    MainChannels["CREATE_NEW_PROJECT"] = "create-new-project";
    MainChannels["CREATE_NEW_PROJECT_CALLBACK"] = "create-new-project-callback";
    MainChannels["SETUP_PROJECT"] = "setup-project";
    MainChannels["SETUP_PROJECT_CALLBACK"] = "setup-project-callback";
    MainChannels["INSTALL_PROJECT_DEPENDENCIES"] = "install-project-dependencies";
    MainChannels["REINSTALL_PROJECT_DEPENDENCIES"] = "reinstall-project-dependencies";
    MainChannels["CREATE_NEW_PROJECT_PROMPT"] = "create-new-project-prompt";
    MainChannels["CREATE_NEW_BLANK_PROJECT"] = "create-new-blank-project";
    MainChannels["CREATE_NEW_PROJECT_PROMPT_CALLBACK"] = "create-new-project-prompt-callback";
    MainChannels["CANCEL_CREATE_NEW_PROJECT_PROMPT"] = "cancel-create-new-project-prompt";
    // Chat
    MainChannels["SEND_CHAT_MESSAGES_STREAM"] = "send-chat-messages-stream";
    MainChannels["SEND_STOP_STREAM_REQUEST"] = "send-stop-stream-request";
    MainChannels["CHAT_STREAM_PARTIAL"] = "chat-stream-partial";
    MainChannels["CHAT_STREAM_ERROR"] = "chat-stream-error";
    MainChannels["GET_CONVERSATIONS_BY_PROJECT"] = "get-conversations-by-project";
    MainChannels["SAVE_CONVERSATION"] = "save-conversation";
    MainChannels["DELETE_CONVERSATION"] = "delete-conversation";
    MainChannels["GENERATE_SUGGESTIONS"] = "generate-suggestions";
    MainChannels["GET_SUGGESTIONS_BY_PROJECT"] = "get-suggestions-by-project";
    MainChannels["SAVE_SUGGESTIONS"] = "save-suggestions";
    MainChannels["GENERATE_CHAT_SUMMARY"] = "generate-chat-summary";
    // Run
    MainChannels["RUN_START"] = "run-start";
    MainChannels["RUN_STOP"] = "run-stop";
    MainChannels["RUN_RESTART"] = "run-restart";
    MainChannels["GET_TEMPLATE_NODE"] = "get-template-node";
    MainChannels["RUN_STATE_CHANGED"] = "run-state-changed";
    MainChannels["GET_RUN_STATE"] = "get-run-state";
    MainChannels["RUN_COMMAND"] = "run-command";
    // Terminal
    MainChannels["TERMINAL_CREATE"] = "terminal-create";
    MainChannels["TERMINAL_ON_DATA"] = "terminal-on-data";
    MainChannels["TERMINAL_INPUT"] = "terminal-input";
    MainChannels["TERMINAL_EXECUTE_COMMAND"] = "terminal-execute-command";
    MainChannels["TERMINAL_RESIZE"] = "terminal-resize";
    MainChannels["TERMINAL_KILL"] = "terminal-kill";
    MainChannels["TERMINAL_GET_HISTORY"] = "terminal-get-history";
    // Hosting
    MainChannels["PUBLISH_TO_DOMAIN"] = "publish-to-domain";
    MainChannels["UNPUBLISH_DOMAIN"] = "unpublish-domain";
    MainChannels["PUBLISH_STATE_CHANGED"] = "publish-state-changed";
    MainChannels["GET_OWNED_DOMAINS"] = "get-owned-domains";
    MainChannels["CREATE_DOMAIN_VERIFICATION"] = "create-domain-verification";
    MainChannels["VERIFY_DOMAIN"] = "verify-domain";
    // Payment
    MainChannels["CREATE_STRIPE_CHECKOUT"] = "create-stripe-checkout";
    MainChannels["CHECK_SUBSCRIPTION"] = "check-subscription";
    MainChannels["MANAGE_SUBSCRIPTION"] = "manage-subscription";
    // Pages
    MainChannels["SCAN_PAGES"] = "scan-pages";
    MainChannels["CREATE_PAGE"] = "create-page";
    MainChannels["DELETE_PAGE"] = "delete-page";
    MainChannels["RENAME_PAGE"] = "rename-page";
    MainChannels["DUPLICATE_PAGE"] = "duplicate-page";
    MainChannels["UPDATE_PAGE_METADATA"] = "update-page-metadata";
    // Images
    MainChannels["SCAN_IMAGES_IN_PROJECT"] = "scan-images-in-project";
    MainChannels["SAVE_IMAGE_TO_PROJECT"] = "save-image-to-project";
    MainChannels["DELETE_IMAGE_FROM_PROJECT"] = "delete-image-from-project";
    MainChannels["RENAME_IMAGE_IN_PROJECT"] = "rename-image-in-project";
    // Config
    MainChannels["SCAN_TAILWIND_CONFIG"] = "scan-tailwind-config";
    MainChannels["UPDATE_TAILWIND_CONFIG"] = "update-tailwind-config";
    MainChannels["DELETE_TAILWIND_CONFIG"] = "delete-tailwind-config";
    MainChannels["SCAN_PROJECT_METADATA"] = "scan-project-metadata";
    // Fonts
    MainChannels["SCAN_FONTS"] = "scan-fonts-config";
    MainChannels["ADD_FONT"] = "add-font";
    MainChannels["REMOVE_FONT"] = "remove-font";
    MainChannels["SET_FONT"] = "set-font";
    MainChannels["GET_DEFAULT_FONT"] = "get-default-font";
    MainChannels["UPLOAD_FONTS"] = "upload-fonts";
    MainChannels["WATCH_FONT_FILE"] = "watch-font-file";
    MainChannels["FONTS_CHANGED"] = "fonts-changed";
    // Trainloop
    MainChannels["SAVE_APPLY_RESULT"] = "save-apply-result";
    // Files
    MainChannels["SCAN_FILES"] = "scan-files";
    MainChannels["GET_PROJECT_FILES"] = "get-project-files";
    MainChannels["FILE_CHANGED"] = "file-changed";
    MainChannels["WATCH_FILE"] = "watch-file";
    MainChannels["UNWATCH_FILE"] = "unwatch-file";
    MainChannels["MARK_FILE_MODIFIED"] = "mark-file-modified";
    // Editor
    MainChannels["SHOW_EDITOR_TAB"] = "show-editor-tab";
})(MainChannels || (exports.MainChannels = MainChannels = {}));
var GitChannels;
(function (GitChannels) {
    GitChannels["IS_REPO_INITIALIZED"] = "is-repo-initialized";
    GitChannels["IS_EMPTY_COMMIT"] = "is-empty-commit";
    GitChannels["INIT_REPO"] = "init-repo";
    GitChannels["ADD"] = "add";
    GitChannels["ADD_ALL"] = "add-all";
    GitChannels["STATUS"] = "status";
    GitChannels["COMMIT"] = "commit";
    GitChannels["CHECKOUT"] = "checkout";
    GitChannels["LIST_COMMITS"] = "list-commits";
    GitChannels["BRANCH"] = "branch";
    GitChannels["GET_CURRENT_COMMIT"] = "get-current-commit";
    GitChannels["RENAME_COMMIT"] = "rename-commit";
})(GitChannels || (exports.GitChannels = GitChannels = {}));
//# sourceMappingURL=ipc.js.map