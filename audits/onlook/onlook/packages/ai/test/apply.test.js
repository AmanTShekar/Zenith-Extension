"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const apply_1 = require("../src/apply");
const hasFastApplyEnv = Boolean(process.env.MORPH_API_KEY) || Boolean(process.env.RELACE_API_KEY);
(0, bun_test_1.describe)('applyCodeChange', () => {
    const run = hasFastApplyEnv ? bun_test_1.it : bun_test_1.it.skip;
    run('should apply code change', async () => {
        const originalCode = `interface User {
  id: string;
  name: string;
}

function fetchUserData(userId) {
  const response = await fetch('/api/users/' + userId);
  return response.json();
}`;
        const updateSnippet = `interface User {
  // other fields
  email?: string;
}

async function fetchUserData(userId: string): Promise<User> {
  // ... existing code
  if (!response.ok) {
    throw new Error('Failed to fetch user: ' + response.status);
  }
  // ... new code
}`;
        const expectedResult = `interface User {
  id: string;
  name: string;
  email?: string;
}

async function fetchUserData(userId: string): Promise<User> {
  const response = await fetch('/api/users/' + userId);
  if (!response.ok) {
    throw new Error('Failed to fetch user: ' + response.status);
  }
  return response.json();
}`;
        const result = await (0, apply_1.applyCodeChange)(originalCode, updateSnippet, 'I will add email field to User interface and improve fetchUserData function with proper typing and error handling', {
            userId: '123',
            projectId: '456',
            conversationId: '789',
        });
        (0, bun_test_1.expect)(result).toBe(expectedResult);
    });
});
//# sourceMappingURL=apply.test.js.map