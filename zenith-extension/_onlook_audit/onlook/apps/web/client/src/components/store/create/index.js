"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateManagerProvider = exports.useCreateManager = void 0;
const react_1 = require("react");
const manager_1 = require("./manager");
const CreateContext = (0, react_1.createContext)(null);
const useCreateManager = () => {
    const ctx = (0, react_1.useContext)(CreateContext);
    if (!ctx)
        throw new Error('useCreateManager must be inside CreateManagerProvider');
    return ctx;
};
exports.useCreateManager = useCreateManager;
const CreateManagerProvider = ({ children }) => {
    const [createManager] = (0, react_1.useState)(() => new manager_1.CreateManager());
    return (<CreateContext.Provider value={createManager}>
            {children}
        </CreateContext.Provider>);
};
exports.CreateManagerProvider = CreateManagerProvider;
//# sourceMappingURL=index.js.map