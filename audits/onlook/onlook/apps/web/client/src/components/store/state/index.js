"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStateManager = void 0;
const react_1 = require("react");
const manager_1 = require("./manager");
const stateManager = new manager_1.StateManager();
const StateContext = (0, react_1.createContext)(stateManager);
const useStateManager = () => (0, react_1.useContext)(StateContext);
exports.useStateManager = useStateManager;
//# sourceMappingURL=index.js.map