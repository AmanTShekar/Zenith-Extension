"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseContext = void 0;
/**
 * Base abstract class for context implementations
 * Provides type-safe static method signatures that subclasses must implement
 */
class BaseContext {
    static contextType;
    static displayName;
    static icon;
    /**
     * Generate formatted prompt content for this context type
     * Subclasses should override with specific context types
     */
    static getPrompt(context) {
        throw new Error('getPrompt must be implemented by subclass');
    }
    /**
     * Generate display label for UI
     * Subclasses should override with specific context types
     */
    static getLabel(context) {
        throw new Error('getLabel must be implemented by subclass');
    }
}
exports.BaseContext = BaseContext;
//# sourceMappingURL=base.js.map