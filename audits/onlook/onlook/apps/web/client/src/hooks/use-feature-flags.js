"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlagsProvider = exports.useFeatureFlags = void 0;
const react_1 = require("react");
const env_1 = require("../env");
const FeatureFlagsContext = (0, react_1.createContext)(undefined);
const useFeatureFlags = () => {
    const context = (0, react_1.useContext)(FeatureFlagsContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
    }
    return context;
};
exports.useFeatureFlags = useFeatureFlags;
const FeatureFlagsProvider = ({ children }) => {
    const flags = Object.keys(env_1.env).reduce((acc, key) => {
        const envKey = key;
        acc[envKey] = env_1.env[envKey] === 'true' || env_1.env[envKey] === true;
        return acc;
    }, {});
    const isEnabled = (flag) => {
        return flags[flag] || false;
    };
    return (<FeatureFlagsContext.Provider value={{ isEnabled, flags }}>
            {children}
        </FeatureFlagsContext.Provider>);
};
exports.FeatureFlagsProvider = FeatureFlagsProvider;
//# sourceMappingURL=use-feature-flags.js.map