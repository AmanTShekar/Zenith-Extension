"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Global test setup file that mocks common dependencies
// This file should be preloaded before all tests to ensure mocks are set up properly
const bun_test_1 = require("bun:test");
console.log('🔧 Setting up test mocks...');
// Create comprehensive mock functions
const createMockMutation = (returnValue) => ({
    mutate: (0, bun_test_1.mock)(async (params) => {
        // console.log('Mock TRPC mutation called with:', params);
        return returnValue || true;
    })
});
const createMockQuery = (returnValue) => ({
    query: (0, bun_test_1.mock)(async (params) => {
        // console.log('Mock TRPC query called with:', params);
        return returnValue || null;
    })
});
// Mock TRPC client to prevent network calls during tests - must be first
bun_test_1.mock.module('@/trpc/client', () => ({
    api: {
        branch: {
            fork: createMockMutation({
                branch: {
                    id: 'mock-branch-id',
                    name: 'Mock Branch',
                    projectId: 'mock-project-id',
                    description: 'Mock forked branch',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isDefault: false,
                    git: null,
                    sandbox: { id: 'mock-sandbox-id' }
                },
                frames: []
            }),
            update: createMockMutation(true),
            delete: createMockMutation(true),
            list: createMockQuery([]),
            get: createMockQuery({
                id: 'mock-branch-id',
                name: 'Mock Branch',
                projectId: 'mock-project',
                description: 'Mock branch',
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: false,
                git: null,
                sandbox: { id: 'mock-sandbox-id' }
            })
        },
        project: {
            get: createMockQuery({
                id: 'mock-project-id',
                name: 'Mock Project',
                createdAt: new Date(),
                updatedAt: new Date()
            })
        },
        sandbox: {
            init: createMockMutation({
                id: 'mock-sandbox-id',
                status: 'ready'
            }),
            status: createMockQuery({ status: 'ready' }),
            start: createMockMutation({
                id: 'mock-sandbox-id',
                status: 'ready',
                url: 'http://localhost:3000'
            }),
            stop: createMockMutation(true),
            restart: createMockMutation({
                id: 'mock-sandbox-id',
                status: 'ready',
                url: 'http://localhost:3000'
            }),
            hibernate: createMockMutation(true)
        }
    }
}));
// Also mock the TRPC React Query hooks
bun_test_1.mock.module('@trpc/react-query', () => ({
    createTRPCReact: (0, bun_test_1.mock)(() => ({
        useQuery: (0, bun_test_1.mock)(() => ({ data: null, isLoading: false, error: null })),
        useMutation: (0, bun_test_1.mock)(() => ({
            mutate: (0, bun_test_1.mock)(() => { }),
            mutateAsync: (0, bun_test_1.mock)(async () => true),
            isLoading: false,
            error: null
        }))
    }))
}));
// Mock toast to avoid UI dependencies
bun_test_1.mock.module('@onlook/ui/sonner', () => ({
    toast: {
        success: (0, bun_test_1.mock)(() => { }),
        error: (0, bun_test_1.mock)(() => { }),
        info: (0, bun_test_1.mock)(() => { }),
        warning: (0, bun_test_1.mock)(() => { }),
        promise: (0, bun_test_1.mock)(() => { })
    }
}));
// Mock MobX to avoid strict mode issues in tests
bun_test_1.mock.module('mobx', () => ({
    makeAutoObservable: (0, bun_test_1.mock)(() => { }),
    reaction: (0, bun_test_1.mock)(() => () => { }),
    runInAction: (0, bun_test_1.mock)((fn) => fn()),
    action: (0, bun_test_1.mock)((fn) => fn),
    observable: (0, bun_test_1.mock)((obj) => obj),
    computed: (0, bun_test_1.mock)((fn) => ({ get: fn }))
}));
// Mock localforage to avoid browser storage dependencies
bun_test_1.mock.module('localforage', () => ({
    getItem: (0, bun_test_1.mock)(async () => null),
    setItem: (0, bun_test_1.mock)(async () => undefined),
    removeItem: (0, bun_test_1.mock)(async () => undefined),
    clear: (0, bun_test_1.mock)(async () => undefined)
}));
//# sourceMappingURL=setup.js.map