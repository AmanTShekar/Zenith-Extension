"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callUserWebhook = callUserWebhook;
const env_1 = require("@/env");
async function callUserWebhook(user) {
    const WEBHOOK_URL = env_1.env.N8N_WEBHOOK_URL;
    const API_KEY = env_1.env.N8N_API_KEY;
    if (!WEBHOOK_URL || !API_KEY) {
        console.warn('N8N_WEBHOOK_URL or N8N_API_KEY is not set, skipping user webhook');
        return;
    }
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'n8n-api-key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                source: user.source,
                subscribed: user.subscribed,
            }),
        });
    }
    catch (error) {
        console.error('Failed to call user webhook', error);
    }
}
//# sourceMappingURL=webhook.js.map