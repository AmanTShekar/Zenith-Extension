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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAnalytics = sendAnalytics;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const Mixpanel = __importStar(require("mixpanel"));
const non_secure_1 = require("nanoid/non-secure");
const storage_1 = require("../storage");
function sendAnalytics(event, data) {
    electron_1.ipcMain.emit(constants_1.MainChannels.SEND_ANALYTICS, '', { event, data });
}
class Analytics {
    static instance;
    mixpanel;
    id;
    constructor() {
        this.restoreSettings();
    }
    static getInstance() {
        if (!Analytics.instance) {
            Analytics.instance = new Analytics();
        }
        return Analytics.instance;
    }
    restoreSettings() {
        const settings = storage_1.PersistentStorage.USER_SETTINGS.read() || {};
        const enable = settings.enableAnalytics !== undefined ? settings.enableAnalytics : true;
        this.id = settings.id;
        if (!this.id) {
            this.id = (0, non_secure_1.nanoid)();
            storage_1.PersistentStorage.USER_SETTINGS.update({ enableAnalytics: enable, id: this.id });
        }
        if (enable) {
            this.enable();
        }
        else {
            this.disable();
        }
    }
    toggleSetting(enable) {
        const settings = storage_1.PersistentStorage.USER_SETTINGS.read() || {};
        if (settings.enableAnalytics === enable) {
            return;
        }
        if (enable) {
            this.enable();
            this.track('enable analytics');
        }
        else {
            this.track('disable analytics');
            this.disable();
        }
        storage_1.PersistentStorage.USER_SETTINGS.update({ enableAnalytics: enable, id: this.id });
    }
    enable() {
        try {
            this.mixpanel = Mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN || '');
            const settings = storage_1.PersistentStorage.USER_METADATA.read();
            if (settings) {
                this.identify(settings);
            }
        }
        catch (error) {
            console.warn('Error initializing Mixpanel:', error);
            console.warn('No Mixpanel client, analytics will not be collected');
        }
    }
    disable() {
        this.mixpanel = undefined;
    }
    track(event, data, callback) {
        if (this.mixpanel) {
            const eventData = {
                distinct_id: this.id,
                ...data,
            };
            this.mixpanel.track(event, eventData, callback);
        }
    }
    trackError(message, data) {
        this.track('error', {
            message,
            ...data,
        });
    }
    identify(user) {
        if (this.mixpanel && this.id) {
            if (user.id !== this.id) {
                this.mixpanel.alias(user.id, this.id);
                storage_1.PersistentStorage.USER_SETTINGS.update({ id: user.id });
            }
            this.mixpanel.people.set(this.id, {
                $name: user.name,
                $email: user.email,
                $avatar: user.avatarUrl,
                platform: process.platform,
                version: electron_1.app.getVersion(),
                architecture: process.arch,
                plan: user.plan,
            });
        }
    }
    updateUserMetadata(user) {
        if (this.mixpanel && this.id) {
            this.mixpanel.people.set(this.id, {
                ...user,
            });
        }
    }
    signOut() {
        storage_1.PersistentStorage.USER_SETTINGS.update({ id: undefined });
    }
}
exports.default = Analytics.getInstance();
//# sourceMappingURL=index.js.map