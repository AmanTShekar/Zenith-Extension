"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInstallationOctokit = createInstallationOctokit;
const auth_app_1 = require("@octokit/auth-app");
const rest_1 = require("@octokit/rest");
const config_1 = require("./config");
/**
 * Create an authenticated Octokit instance for a specific installation
 */
function createInstallationOctokit(installationId) {
    const config = (0, config_1.getGitHubAppConfig)();
    if (!installationId || installationId.trim() === '') {
        throw new Error('Installation ID is required and cannot be empty.');
    }
    return new rest_1.Octokit({
        authStrategy: auth_app_1.createAppAuth,
        auth: {
            appId: config.appId,
            privateKey: config.privateKey,
            installationId: parseInt(installationId, 10),
        },
    });
}
//# sourceMappingURL=auth.js.map