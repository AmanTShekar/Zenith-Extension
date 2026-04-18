"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGitHubAppConfig = validateGitHubAppConfig;
exports.getGitHubAppConfig = getGitHubAppConfig;
/**
 * Validate GitHub App configuration
 */
function validateGitHubAppConfig(config) {
    return !!(config.appId &&
        config.privateKey &&
        config.slug);
}
/**
 * Get GitHub App configuration from environment variables
 * Throws an error if configuration is invalid
 */
function getGitHubAppConfig() {
    const config = {
        appId: process.env.GITHUB_APP_ID,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
        slug: process.env.GITHUB_APP_SLUG,
    };
    if (!validateGitHubAppConfig(config)) {
        throw new Error('GitHub App configuration is missing or invalid. Please check your environment variables: GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, GITHUB_APP_SLUG');
    }
    return config;
}
//# sourceMappingURL=config.js.map