"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDropdownControl = exports.useDropdownManager = exports.DropdownManagerProvider = void 0;
const react_1 = require("react");
const DropdownManagerContext = (0, react_1.createContext)(null);
const DropdownManagerProvider = ({ children }) => {
    const [openDropdownId, setOpenDropdownId] = (0, react_1.useState)(null);
    const [dropdownCallbacks, setDropdownCallbacks] = (0, react_1.useState)(new Map());
    const registerDropdown = (0, react_1.useCallback)((id, onClose) => {
        setDropdownCallbacks(prev => new Map(prev).set(id, onClose));
    }, []);
    const unregisterDropdown = (0, react_1.useCallback)((id) => {
        setDropdownCallbacks(prev => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
        });
    }, []);
    const openDropdown = (0, react_1.useCallback)((id) => {
        // Close the currently open dropdown if it's different
        if (openDropdownId && openDropdownId !== id) {
            const closeCallback = dropdownCallbacks.get(openDropdownId);
            if (closeCallback) {
                closeCallback();
            }
        }
        setOpenDropdownId(id);
    }, [openDropdownId, dropdownCallbacks]);
    const closeDropdown = (0, react_1.useCallback)((id) => {
        if (openDropdownId === id) {
            setOpenDropdownId(null);
        }
    }, [openDropdownId]);
    const closeAllDropdowns = (0, react_1.useCallback)(() => {
        if (openDropdownId) {
            const closeCallback = dropdownCallbacks.get(openDropdownId);
            if (closeCallback) {
                closeCallback();
            }
        }
        setOpenDropdownId(null);
    }, [openDropdownId, dropdownCallbacks]);
    const contextValue = {
        openDropdownId,
        registerDropdown,
        unregisterDropdown,
        openDropdown,
        closeDropdown,
        closeAllDropdowns,
    };
    return (<DropdownManagerContext.Provider value={contextValue}>
            {children}
        </DropdownManagerContext.Provider>);
};
exports.DropdownManagerProvider = DropdownManagerProvider;
const useDropdownManager = () => {
    const context = (0, react_1.useContext)(DropdownManagerContext);
    if (!context) {
        throw new Error('useDropdownManager must be used within a DropdownManagerProvider');
    }
    return context;
};
exports.useDropdownManager = useDropdownManager;
const useDropdownControl = ({ id, onOpenChange, isOverflow = false }) => {
    const { openDropdownId, registerDropdown, unregisterDropdown, openDropdown, closeDropdown } = (0, exports.useDropdownManager)();
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const handleOpenChange = (0, react_1.useCallback)((open) => {
        if (open) {
            openDropdown(id);
            setIsOpen(true);
        }
        else {
            closeDropdown(id);
            setIsOpen(false);
        }
        onOpenChange?.(open);
    }, [id, openDropdown, closeDropdown, onOpenChange]);
    const onOpenChangeRef = (0, react_1.useRef)(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const stableHandleClose = (0, react_1.useCallback)(() => {
        if (isOverflow)
            return;
        setIsOpen(false);
        onOpenChangeRef.current?.(false);
    }, [isOverflow]);
    (0, react_1.useEffect)(() => {
        registerDropdown(id, stableHandleClose);
        return () => unregisterDropdown(id);
    }, [id, registerDropdown, unregisterDropdown, stableHandleClose]);
    (0, react_1.useEffect)(() => {
        const shouldBeOpen = openDropdownId === id;
        if (!isOverflow && shouldBeOpen !== isOpen) {
            setIsOpen(shouldBeOpen);
            onOpenChangeRef.current?.(shouldBeOpen);
        }
    }, [openDropdownId, id, isOverflow]);
    return {
        isOpen,
        onOpenChange: handleOpenChange,
    };
};
exports.useDropdownControl = useDropdownControl;
//# sourceMappingURL=use-dropdown-manager.js.map