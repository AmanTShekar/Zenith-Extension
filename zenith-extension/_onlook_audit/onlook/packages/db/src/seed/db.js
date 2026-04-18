"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDb = exports.seedDb = void 0;
const project_1 = require("@/defaults/project");
const constants_1 = require("@onlook/constants");
const db_1 = require("@onlook/db");
const client_1 = require("@onlook/db/src/client");
const models_1 = require("@onlook/models");
const stripe_1 = require("@onlook/stripe");
const uuid_1 = require("uuid");
const branch_1 = require("../defaults/branch");
const constants_2 = require("./constants");
const user0 = {
    id: constants_2.SEED_USER.ID,
    email: constants_2.SEED_USER.EMAIL,
    firstName: constants_2.SEED_USER.FIRST_NAME,
    lastName: constants_2.SEED_USER.LAST_NAME,
    displayName: constants_2.SEED_USER.DISPLAY_NAME,
    avatarUrl: constants_2.SEED_USER.AVATAR_URL,
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: null,
    githubInstallationId: null,
};
const project0 = (0, project_1.createDefaultProject)({
    overrides: {
        name: 'Preload Script Test',
    },
});
const project1 = (0, project_1.createDefaultProject)({
    overrides: {
        name: 'Mock Template (This doesn\'t work)',
        tags: [constants_1.Tags.TEMPLATE],
    },
});
const branch0 = (0, branch_1.createDefaultBranch)({
    projectId: project0.id,
    sandboxId: '123456',
});
const branch1 = {
    id: (0, uuid_1.v4)(),
    projectId: project0.id,
    name: 'branch1',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'Secondary branch',
    gitBranch: null,
    gitCommitSha: null,
    gitRepoUrl: null,
    sandboxId: '123456',
};
const branch2 = {
    id: (0, uuid_1.v4)(),
    projectId: project1.id,
    name: 'main',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'Main branch',
    gitBranch: null,
    gitCommitSha: null,
    gitRepoUrl: null,
    sandboxId: '123456',
};
const branch3 = {
    id: (0, uuid_1.v4)(),
    projectId: project1.id,
    name: 'branch1',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'Secondary branch',
    gitBranch: null,
    gitCommitSha: null,
    gitRepoUrl: null,
    sandboxId: '123456',
};
const canvas0 = (0, db_1.createDefaultCanvas)(project0.id);
const frame0 = (0, db_1.createDefaultFrame)({
    canvasId: canvas0.id,
    branchId: branch0.id,
    url: 'http://localhost:8084',
});
const userCanvas0 = (0, db_1.createDefaultUserCanvas)(user0.id, canvas0.id);
const canvas1 = (0, db_1.createDefaultCanvas)(project1.id);
const frame1 = (0, db_1.createDefaultFrame)({
    canvasId: canvas1.id,
    branchId: branch2.id,
    url: 'http://localhost:8084',
});
const userCanvas1 = (0, db_1.createDefaultUserCanvas)(user0.id, canvas1.id);
const conversation0 = {
    id: (0, uuid_1.v4)(),
    projectId: project0.id,
    displayName: 'Test Conversation',
    createdAt: new Date(),
    updatedAt: new Date(),
    suggestions: [
        {
            title: 'Test Suggestion',
            prompt: 'Test Prompt',
        },
        {
            title: 'Test Suggestion 2',
            prompt: 'Test Prompt 2',
        },
        {
            title: 'Test Suggestion 3',
            prompt: 'Test Prompt 3',
        },
    ],
};
const context0 = {
    type: models_1.MessageContextType.FILE,
    path: 'src/index.ts',
    displayName: 'index.ts',
    content: 'console.log("Hello, world!");',
    branchId: branch0.id,
};
const context1 = {
    type: models_1.MessageContextType.HIGHLIGHT,
    path: 'src/index.ts',
    displayName: 'index.ts',
    content: 'console.log("Hello, world!");',
    start: 0,
    end: 10,
    branchId: branch0.id,
};
const contexts = [context0, context1];
const message0 = {
    id: (0, uuid_1.v4)(),
    conversationId: conversation0.id,
    role: 'user',
    content: 'Test message 0',
    commitOid: null,
    createdAt: new Date(),
    applied: false,
    context: contexts,
    checkpoints: [],
    parts: [{ type: 'text', text: 'Test message 0' }],
    snapshots: null,
    usage: null,
};
const message1 = {
    id: (0, uuid_1.v4)(),
    conversationId: conversation0.id,
    role: 'assistant',
    content: 'Test message 1',
    commitOid: null,
    createdAt: new Date(),
    applied: false,
    context: contexts,
    parts: [{ type: 'text', text: 'Test message 1' }],
    checkpoints: [],
    snapshots: null,
    usage: null,
};
const message2 = {
    id: (0, uuid_1.v4)(),
    conversationId: conversation0.id,
    role: 'assistant',
    content: 'Test message 2',
    commitOid: null,
    createdAt: new Date(),
    applied: false,
    context: contexts,
    parts: [{ type: 'text', text: 'Test message 2' }],
    checkpoints: [],
    snapshots: null,
    usage: null,
};
const message3 = {
    id: (0, uuid_1.v4)(),
    conversationId: conversation0.id,
    role: 'user',
    content: 'Test message 3',
    commitOid: null,
    createdAt: new Date(),
    applied: false,
    context: contexts,
    parts: [{ type: 'text', text: 'Test message 3' }],
    checkpoints: [],
    snapshots: null,
    usage: null,
};
const message4 = {
    id: (0, uuid_1.v4)(),
    conversationId: conversation0.id,
    role: 'assistant',
    content: 'Test message 4',
    createdAt: new Date(),
    applied: false,
    context: contexts,
    parts: [{ type: 'text', text: 'Test message 4' }],
    checkpoints: [],
    snapshots: null,
    commitOid: null,
    usage: null,
};
const product0 = {
    id: (0, uuid_1.v4)(),
    name: 'Test Pro Product',
    type: stripe_1.ProductType.PRO,
    stripeProductId: 'prod_1234567890',
};
const price0 = {
    id: (0, uuid_1.v4)(),
    productId: product0.id,
    key: stripe_1.PriceKey.PRO_MONTHLY_TIER_1,
    monthlyMessageLimit: 100,
    stripePriceId: 'price_1234567890',
};
const subscription0 = {
    id: (0, uuid_1.v4)(),
    userId: user0.id,
    productId: product0.id,
    priceId: price0.id,
    startedAt: new Date(),
    updatedAt: new Date(),
    status: stripe_1.SubscriptionStatus.ACTIVE,
    stripeCustomerId: 'cus_1234567890',
    stripeSubscriptionId: 'sub_1234567890',
    stripeSubscriptionScheduleId: null,
    stripeSubscriptionItemId: 'si_1234567890',
    scheduledAction: null,
    scheduledPriceId: null,
    scheduledChangeAt: null,
    endedAt: null,
    stripeCurrentPeriodStart: new Date(),
    stripeCurrentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
};
const rateLimit0 = {
    id: (0, uuid_1.v4)(),
    userId: user0.id,
    subscriptionId: subscription0.id,
    max: 100,
    left: 100,
    startedAt: new Date(),
    endedAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    carryOverKey: (0, uuid_1.v4)(),
    carryOverTotal: 0,
    stripeSubscriptionItemId: subscription0.stripeSubscriptionItemId,
    updatedAt: new Date(),
};
const seedDb = async () => {
    console.log('Seeding the database...');
    await client_1.db.transaction(async (tx) => {
        await tx.insert(db_1.users).values(user0);
        await tx.insert(db_1.products).values([product0]);
        await tx.insert(db_1.prices).values([price0]);
        await tx.insert(db_1.subscriptions).values([subscription0]);
        await tx.insert(db_1.rateLimits).values([rateLimit0]);
        await tx.insert(db_1.projects).values([project0, project1]);
        await tx.insert(db_1.branches).values([branch0, branch1, branch2, branch3]);
        await tx.insert(db_1.userProjects).values([
            {
                userId: user0.id,
                projectId: project0.id,
                role: models_1.ProjectRole.OWNER,
            },
            {
                userId: user0.id,
                projectId: project1.id,
                role: models_1.ProjectRole.OWNER,
            },
        ]);
        await tx.insert(db_1.canvases).values([canvas0, canvas1]);
        await tx.insert(db_1.userCanvases).values([userCanvas0, userCanvas1]);
        await tx.insert(db_1.frames).values([frame0, frame1]);
        await tx.insert(db_1.conversations).values([conversation0]);
        await tx.insert(db_1.messages).values([message0, message1, message2, message3, message4]);
    });
    console.log('Database seeded!');
};
exports.seedDb = seedDb;
const resetDb = async () => {
    console.log('Resetting the database...');
    await client_1.db.transaction(async (tx) => {
        await tx.delete(db_1.deployments);
        await tx.delete(db_1.previewDomains);
        await tx.delete(db_1.projectCustomDomains);
        await tx.delete(db_1.userCanvases);
        await tx.delete(db_1.userProjects);
        await tx.delete(db_1.usageRecords);
        await tx.delete(db_1.rateLimits);
        await tx.delete(db_1.subscriptions);
        await tx.delete(db_1.prices);
        await tx.delete(db_1.products);
        await tx.delete(db_1.messages);
        await tx.delete(db_1.conversations);
        await tx.delete(db_1.frames);
        await tx.delete(db_1.canvases);
        await tx.delete(db_1.branches);
        await tx.delete(db_1.userProjects);
        await tx.delete(db_1.projects);
        await tx.delete(db_1.users);
        await tx.delete(db_1.legacySubscriptions);
    });
    console.log('Database reset!');
};
exports.resetDb = resetDb;
//# sourceMappingURL=db.js.map