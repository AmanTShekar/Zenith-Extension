"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDomainVerification = exports.DomainVerificationProvider = exports.VerificationState = void 0;
const editor_1 = require("@/components/store/editor");
const react_1 = require("@/trpc/react");
const models_1 = require("@onlook/models");
const react_2 = require("react");
const sonner_1 = require("sonner");
var VerificationState;
(function (VerificationState) {
    VerificationState["INPUTTING_DOMAIN"] = "inputting_domain";
    VerificationState["CREATING_VERIFICATION"] = "creating_verification";
    VerificationState["VERIFICATION_CREATED"] = "verification_created";
    VerificationState["VERIFYING"] = "verifying";
    VerificationState["VERIFIED"] = "verified";
})(VerificationState || (exports.VerificationState = VerificationState = {}));
const DomainVerificationContext = (0, react_2.createContext)(undefined);
const DomainVerificationProvider = ({ children }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [verificationState, setVerificationState] = (0, react_2.useState)(VerificationState.INPUTTING_DOMAIN);
    const [error, setError] = (0, react_2.useState)(null);
    const { data: customDomain, refetch: refetchCustomDomain } = react_1.api.domain.custom.get.useQuery({ projectId: editorEngine.projectId });
    const { data: verification, refetch: refetchVerification } = react_1.api.domain.verification.getActive.useQuery({ projectId: editorEngine.projectId });
    const { mutateAsync: createDomainVerification } = react_1.api.domain.verification.create.useMutation();
    const { mutateAsync: removeDomainVerification } = react_1.api.domain.verification.remove.useMutation();
    const { mutateAsync: verifyDomain } = react_1.api.domain.verification.verify.useMutation();
    const { data: ownedDomains = [] } = react_1.api.domain.custom.getOwnedDomains.useQuery();
    const { mutateAsync: verifyOwnedDomain } = react_1.api.domain.verification.verifyOwnedDomain.useMutation();
    const { mutateAsync: removeProjectCustomDomain } = react_1.api.domain.custom.remove.useMutation();
    const [domainInput, setDomainInput] = (0, react_2.useState)(verification?.fullDomain ?? '');
    (0, react_2.useEffect)(() => {
        if (verification === undefined) {
            return;
        }
        if (verification === null) {
            setVerificationState(VerificationState.INPUTTING_DOMAIN);
            return;
        }
        if (verification.status === models_1.VerificationRequestStatus.PENDING) {
            setVerificationState(VerificationState.VERIFICATION_CREATED);
        }
        else if (verification.status === models_1.VerificationRequestStatus.VERIFIED) {
            setVerificationState(VerificationState.VERIFIED);
        }
    }, [verification]);
    const createVerificationRequest = async () => {
        try {
            setVerificationState(VerificationState.CREATING_VERIFICATION);
            setError(null);
            const verificationRequest = await createDomainVerification({
                domain: domainInput,
                projectId: editorEngine.projectId,
            });
            if (!verificationRequest) {
                setError('Failed to create domain verification');
                setVerificationState(VerificationState.INPUTTING_DOMAIN);
                return;
            }
            await refetchVerification();
            setError(null);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create domain verification');
        }
    };
    const removeVerificationRequest = async () => {
        try {
            if (!verification) {
                setError('No verification request to remove');
                return;
            }
            await removeDomainVerification({
                verificationId: verification.id,
            });
            await refetchVerification();
            setVerificationState(VerificationState.INPUTTING_DOMAIN);
            setError(null);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to remove verification request');
        }
    };
    const verifyVerificationRequest = async () => {
        try {
            if (!verification) {
                setError('No verification request to verify');
                return;
            }
            const { success, failureReason, } = await verifyDomain({
                verificationId: verification.id,
            });
            if (!success || failureReason) {
                setError(failureReason ?? 'Failed to verify domain');
                return;
            }
            await Promise.all([
                refetchVerification(),
                refetchCustomDomain(),
            ]);
            setVerificationState(VerificationState.VERIFIED);
            sonner_1.toast.success('Domain verified');
            setError(null);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to verify domain');
        }
    };
    const reuseDomain = async (domain) => {
        try {
            setError(null);
            const { success, failureReason, } = await verifyOwnedDomain({
                fullDomain: domain,
                projectId: editorEngine.projectId,
            });
            if (!success || failureReason) {
                setError(failureReason ?? 'Failed to reuse domain');
                return;
            }
            await refetchVerification();
            setVerificationState(VerificationState.VERIFIED);
            setError(null);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to reuse domain');
        }
    };
    const removeVerifiedDomain = async (domain) => {
        try {
            const res = await removeProjectCustomDomain({
                domain,
                projectId: editorEngine.projectId,
            });
            if (!res) {
                setError('Failed to remove verified domain');
                return;
            }
            await refetchVerification();
            setVerificationState(VerificationState.INPUTTING_DOMAIN);
            setError(null);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to remove verified domain');
        }
    };
    return (<DomainVerificationContext.Provider value={{
            domainInput,
            setDomainInput,
            createVerificationRequest,
            removeVerificationRequest,
            verifyVerificationRequest,
            customDomain: customDomain ?? null,
            verification: verification ?? null,
            verificationState,
            error,
            ownedDomains,
            reuseDomain,
            removeVerifiedDomain,
        }}>
            {children}
        </DomainVerificationContext.Provider>);
};
exports.DomainVerificationProvider = DomainVerificationProvider;
const useDomainVerification = () => {
    const context = (0, react_2.useContext)(DomainVerificationContext);
    if (context === undefined) {
        throw new Error('useDomainVerification must be used within a DomainVerificationProvider');
    }
    return context;
};
exports.useDomainVerification = useDomainVerification;
//# sourceMappingURL=use-domain-verification.js.map