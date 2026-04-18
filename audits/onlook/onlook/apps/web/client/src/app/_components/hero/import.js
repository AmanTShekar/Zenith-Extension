"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Import = Import;
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const index_1 = require("@onlook/ui/icons/index");
const localforage_1 = __importDefault(require("localforage"));
const navigation_1 = require("next/navigation");
const auth_context_1 = require("../../auth/auth-context");
function Import() {
    const router = (0, navigation_1.useRouter)();
    const { data: user } = react_1.api.user.get.useQuery();
    const { setIsAuthModalOpen } = (0, auth_context_1.useAuthContext)();
    const handleImportProject = () => {
        if (!user?.id) {
            // Store the return URL and open auth modal
            localforage_1.default.setItem(constants_1.LocalForageKeys.RETURN_URL, constants_1.Routes.IMPORT_PROJECT);
            setIsAuthModalOpen(true);
            return;
        }
        // Navigate to import project flow
        router.push(constants_1.Routes.IMPORT_PROJECT);
    };
    return (<button onClick={handleImportProject} className="text-sm text-foreground-secondary hover:text-foreground transition-colors duration-200 flex items-center gap-2">
            <index_1.Icons.Upload className="w-4 h-4"/>
            Import a Next.js App
        </button>);
}
//# sourceMappingURL=import.js.map