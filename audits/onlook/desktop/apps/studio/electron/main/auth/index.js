"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAuthAutoRefresh = startAuthAutoRefresh;
exports.stopAuthAutoRefresh = stopAuthAutoRefresh;
exports.setupAuthAutoRefresh = setupAuthAutoRefresh;
exports.cleanupAuthAutoRefresh = cleanupAuthAutoRefresh;
exports.signIn = signIn;
exports.handleAuthCallback = handleAuthCallback;
exports.getRefreshedAuthTokens = getRefreshedAuthTokens;
exports.signOut = signOut;
const constants_1 = require("@onlook/models/constants");
const clients_1 = __importDefault(require("@onlook/supabase/clients"));
const electron_1 = require("electron");
const __1 = require("..");
const analytics_1 = __importStar(require("../analytics"));
const storage_1 = require("../storage");
let isAutoRefreshEnabled = false;
let sessionSubscription;
async function startAuthAutoRefresh() {
    if (!clients_1.default || isAutoRefreshEnabled) {
        return;
    }
    try {
        await clients_1.default.auth.startAutoRefresh();
        isAutoRefreshEnabled = true;
        console.log('Started auto-refresh for auth session');
    }
    catch (error) {
        console.error('Failed to start auto-refresh:', error);
    }
}
async function stopAuthAutoRefresh() {
    if (!clients_1.default || !isAutoRefreshEnabled) {
        return;
    }
    try {
        await clients_1.default.auth.stopAutoRefresh();
        isAutoRefreshEnabled = false;
        console.log('Stopped auto-refresh for auth session');
    }
    catch (error) {
        console.error('Failed to stop auto-refresh:', error);
    }
}
function setupAuthAutoRefresh() {
    if (!__1.mainWindow) {
        return;
    }
    cleanupAuthAutoRefresh();
    __1.mainWindow.on('focus', startAuthAutoRefresh);
    __1.mainWindow.on('blur', stopAuthAutoRefresh);
    if (__1.mainWindow.isFocused()) {
        startAuthAutoRefresh();
    }
}
function cleanupAuthAutoRefresh() {
    if (!__1.mainWindow) {
        return;
    }
    __1.mainWindow.removeListener('focus', startAuthAutoRefresh);
    __1.mainWindow.removeListener('blur', stopAuthAutoRefresh);
    stopAuthAutoRefresh();
}
async function signIn(provider) {
    if (!clients_1.default) {
        throw new Error('No backend connected');
    }
    clients_1.default.auth.signOut();
    const { data, error } = await clients_1.default.auth.signInWithOAuth({
        provider,
        options: {
            skipBrowserRedirect: true,
            redirectTo: constants_1.APP_SCHEMA + '://auth',
        },
    });
    if (error) {
        console.error('Authentication error:', error);
        return;
    }
    electron_1.shell.openExternal(data.url);
    (0, analytics_1.sendAnalytics)('sign in', { provider });
}
async function handleAuthCallback(url) {
    if (!url.startsWith(constants_1.APP_SCHEMA + '://auth')) {
        return;
    }
    const authTokens = getTokenFromCallbackUrl(url);
    storage_1.PersistentStorage.AUTH_TOKENS.replace(authTokens);
    if (!clients_1.default) {
        throw new Error('No backend connected');
    }
    const { data: { user }, error, } = await clients_1.default.auth.getUser(authTokens.accessToken);
    if (error) {
        throw error;
    }
    if (!user) {
        throw new Error('No user found');
    }
    const userMetadata = getUserMetadata(user);
    storage_1.PersistentStorage.USER_METADATA.replace(userMetadata);
    analytics_1.default.identify(userMetadata);
    emitSignInEvent();
    listenForSessionChanges(clients_1.default);
}
function emitSignInEvent() {
    __1.mainWindow?.webContents.send(constants_1.MainChannels.USER_SIGNED_IN);
}
function getTokenFromCallbackUrl(url) {
    const fragmentParams = new URLSearchParams(url.split('#')[1]);
    const accessToken = fragmentParams.get('access_token');
    const refreshToken = fragmentParams.get('refresh_token');
    const expiresAt = fragmentParams.get('expires_at');
    const expiresIn = fragmentParams.get('expires_in');
    const providerToken = fragmentParams.get('provider_token');
    const tokenType = fragmentParams.get('token_type');
    if (!accessToken || !refreshToken || !expiresAt || !expiresIn || !providerToken || !tokenType) {
        throw new Error('Invalid token');
    }
    return {
        accessToken,
        refreshToken,
        expiresAt,
        expiresIn,
        providerToken,
        tokenType,
    };
}
function getUserMetadata(user) {
    const userMetadata = {
        id: user.id,
        email: user.email,
        name: user.user_metadata.full_name,
        avatarUrl: user.user_metadata.avatar_url,
    };
    return userMetadata;
}
async function getRefreshedAuthTokens() {
    if (!clients_1.default) {
        throw new Error('No backend connected');
    }
    const { data: { session: currentSession }, } = await clients_1.default.auth.getSession();
    if (currentSession) {
        const authTokens = getAuthTokensFromSession(currentSession);
        storage_1.PersistentStorage.AUTH_TOKENS.replace(authTokens);
        return authTokens;
    }
    const authTokens = storage_1.PersistentStorage.AUTH_TOKENS.read();
    if (!authTokens) {
        throw new Error('No auth tokens found');
    }
    const { data: { session: refreshedSession }, error, } = await clients_1.default.auth.setSession({
        access_token: authTokens.accessToken,
        refresh_token: authTokens.refreshToken,
    });
    if (error || !refreshedSession) {
        throw new Error('Failed to refresh session, you may need to sign in again. ' + error);
    }
    const refreshedAuthTokens = getAuthTokensFromSession(refreshedSession);
    // Save the refreshed auth tokens to the persistent storage
    storage_1.PersistentStorage.AUTH_TOKENS.replace(refreshedAuthTokens);
    return refreshedAuthTokens;
}
function getAuthTokensFromSession(session) {
    const refreshedAuthTokens = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at?.toString() ?? '',
        expiresIn: session.expires_in.toString(),
        providerToken: session.provider_token ?? '',
        tokenType: session.token_type ?? '',
    };
    return refreshedAuthTokens;
}
async function signOut() {
    (0, analytics_1.sendAnalytics)('sign out');
    analytics_1.default.signOut();
    await clients_1.default?.auth.signOut();
    storage_1.PersistentStorage.USER_METADATA.clear();
    storage_1.PersistentStorage.AUTH_TOKENS.clear();
    __1.mainWindow?.webContents.send(constants_1.MainChannels.USER_SIGNED_OUT);
    unsubscribeFromSessionChanges();
}
function listenForSessionChanges(supabase) {
    if (sessionSubscription) {
        console.log('Already listening for session changes');
        return;
    }
    const { data: { subscription }, } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            const authTokens = getAuthTokensFromSession(session);
            storage_1.PersistentStorage.AUTH_TOKENS.replace(authTokens);
        }
    });
    sessionSubscription = subscription;
}
function unsubscribeFromSessionChanges() {
    if (sessionSubscription) {
        sessionSubscription.unsubscribe();
        sessionSubscription = undefined;
    }
}
//# sourceMappingURL=index.js.map