"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostingProviderFactory = void 0;
const models_1 = require("@onlook/models");
const freestyle_1 = require("./adapters/freestyle");
class HostingProviderFactory {
    static create(provider = models_1.HostingProvider.FREESTYLE) {
        switch (provider) {
            case models_1.HostingProvider.FREESTYLE:
                return new freestyle_1.FreestyleAdapter();
            default:
                throw new Error(`Unsupported hosting provider: ${provider}`);
        }
    }
}
exports.HostingProviderFactory = HostingProviderFactory;
//# sourceMappingURL=hosting-factory.js.map