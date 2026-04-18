"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInstallationUrl = generateInstallationUrl;
exports.handleInstallationCallback = handleInstallationCallback;
const uuid_1 = require("uuid");
const config_1 = require("./config");
/**
 * Generate a secure installation URL for GitHub App
 */
function generateInstallationUrl(options = {}) {
    const config = (0, config_1.getGitHubAppConfig)();
    const state = options.state || (0, uuid_1.v4)();
    const params = new URLSearchParams({
        state,
    });
    if (options.redirectUrl) {
        params.append('redirect_uri', options.redirectUrl);
    }
    // Use the standard GitHub App installation URL pattern
    // This should work with any properly configured GitHub App
    const url = `https://github.com/apps/${config.slug}/installations/new?${params.toString()}`;
    return { url, state };
}
/**
 * Handle GitHub App installation callback
 */
function handleInstallationCallback(query) {
    const installationId = Array.isArray(query.installation_id)
        ? query.installation_id[0]
        : query.installation_id;
    const setupAction = Array.isArray(query.setup_action)
        ? query.setup_action[0]
        : query.setup_action;
    const state = Array.isArray(query.state)
        ? query.state[0]
        : query.state;
    if (!installationId || !setupAction) {
        return null;
    }
    return {
        installationId,
        setupAction,
        state,
    };
}
//# sourceMappingURL=installation.js.map