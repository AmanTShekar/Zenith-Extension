"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verification = void 0;
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const use_toast_1 = require("@onlook/ui/use-toast");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const RecordField_1 = require("./RecordField");
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["NO_DOMAIN"] = "no_domain";
    VerificationStatus["VERIFYING"] = "verifying";
    VerificationStatus["VERIFIED"] = "verified";
    VerificationStatus["LOADING"] = "loading";
})(VerificationStatus || (VerificationStatus = {}));
exports.Verification = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const domainsManager = projectsManager.domains;
    const [status, setStatus] = (0, react_1.useState)(VerificationStatus.NO_DOMAIN);
    const [domain, setDomain] = (0, react_1.useState)('');
    const [records, setRecords] = (0, react_1.useState)([]);
    const [error, setError] = (0, react_1.useState)();
    const [ownedDomains, setOwnedDomains] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (domainsManager) {
            domainsManager.getOwnedDomains().then((domains) => {
                setOwnedDomains(domains);
            });
        }
    }, [editorEngine.isSettingsOpen]);
    function editDomain() {
        setStatus(VerificationStatus.NO_DOMAIN);
        setRecords([]);
    }
    function onDomainInputChange(e) {
        const value = e.target.value;
        setDomain(value);
        const { isValid, error } = (0, utility_1.isApexDomain)(value);
        if (!isValid) {
            setError(error);
        }
        else {
            setError(null);
        }
    }
    function validateDomain() {
        if (!domain) {
            setError('Domain is required');
            return false;
        }
        try {
            const { isValid, error } = (0, utility_1.isApexDomain)(domain);
            if (!isValid) {
                setError(error);
                return false;
            }
            setError(null);
            const url = new URL((0, utility_1.getValidUrl)(domain.trim()));
            const hostname = url.hostname.toLowerCase();
            return hostname;
        }
        catch (err) {
            setError('Invalid domain format');
            return false;
        }
    }
    async function setupDomain() {
        const validDomain = validateDomain();
        if (!validDomain) {
            return;
        }
        setDomain(validDomain);
        setStatus(VerificationStatus.LOADING);
        setError(null);
        // Send verification request to server
        const response = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.CREATE_DOMAIN_VERIFICATION, {
            domain: validDomain,
        });
        if (!response.success || !response.verificationCode) {
            setError(response.message ?? 'Failed to create domain verification');
            setStatus(VerificationStatus.NO_DOMAIN);
            return;
        }
        setStatus(VerificationStatus.VERIFYING);
        const verificationRecord = getVerificationRecord(response.verificationCode);
        const aRecords = getARecords();
        setRecords([verificationRecord, ...aRecords]);
        setError(null);
    }
    async function verifyDomain() {
        (0, utils_1.sendAnalytics)('verify domain', {
            domain: domain,
        });
        setStatus(VerificationStatus.LOADING);
        setError(null);
        const response = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.VERIFY_DOMAIN, {
            domain: domain,
        });
        if (!response.success) {
            setError(response.message ?? 'Failed to verify domain');
            setStatus(VerificationStatus.VERIFYING);
            (0, utils_1.sendAnalytics)('verify domain failed', {
                domain: domain,
                error: response.message ?? 'Failed to verify domain',
            });
            return;
        }
        setStatus(VerificationStatus.VERIFIED);
        setError(null);
        addCustomDomain(domain);
        handleDomainVerified();
        (0, utils_1.sendAnalytics)('verify domain success', {
            domain: domain,
        });
    }
    const handleDomainVerified = () => {
        (0, use_toast_1.toast)({
            title: 'Domain verified!',
            description: 'Your domain is verified and ready to publish.',
        });
        setTimeout(() => {
            editorEngine.isSettingsOpen = false;
            editorEngine.isPublishOpen = true;
        }, 1000);
    };
    const addCustomDomain = (url) => {
        (0, utils_1.sendAnalytics)('add custom domain', {
            domain: url,
        });
        if (!domainsManager) {
            setError('Failed to add custom domain');
            (0, utils_1.sendAnalytics)('add custom domain failed', {
                domain: url,
                error: 'domains manager not found',
            });
            return;
        }
        domainsManager.addCustomDomainToProject(url);
        setStatus(VerificationStatus.VERIFIED);
        setDomain(url);
        setError(null);
        handleDomainVerified();
        (0, utils_1.sendAnalytics)('add custom domain success', {
            domain: url,
        });
    };
    function removeDomain() {
        (0, utils_1.sendAnalytics)('remove custom domain', {
            domain: domain,
        });
        setStatus(VerificationStatus.NO_DOMAIN);
        setDomain('');
        setRecords([]);
    }
    function getVerificationRecord(verificationCode) {
        const verificationRecord = {
            type: 'TXT',
            host: constants_1.FRESTYLE_CUSTOM_HOSTNAME,
            value: verificationCode,
        };
        return verificationRecord;
    }
    function getARecords() {
        const aRecords = [];
        const apexRecord = {
            type: 'A',
            host: '@',
            value: constants_1.FREESTYLE_IP_ADDRESS,
        };
        const wwwRecord = {
            type: 'A',
            host: 'www',
            value: constants_1.FREESTYLE_IP_ADDRESS,
        };
        aRecords.push(apexRecord, wwwRecord);
        return aRecords;
    }
    function renderExistingDomains() {
        if (ownedDomains.length === 0 || status !== VerificationStatus.NO_DOMAIN) {
            return null;
        }
        return (<div className="flex flex-col gap-2 flex-1">
                {ownedDomains.map((domain) => (<div key={domain} className="flex items-center text-small text-muted-foreground">
                        <p>{domain}</p>
                        <button_1.Button variant="outline" size="sm" className="ml-auto" onClick={() => {
                    addCustomDomain(domain);
                }}>
                            Use Domain
                        </button_1.Button>
                    </div>))}
            </div>);
    }
    function getInputButtonText() {
        if (status === VerificationStatus.NO_DOMAIN) {
            return 'Setup';
        }
        if (status === VerificationStatus.LOADING) {
            return 'Loading...';
        }
        return 'Edit';
    }
    function renderNoDomainInput() {
        return (<div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="w-1/3">
                        <p className="text-regularPlus text-muted-foreground">Custom URL</p>
                        <p className="text-small text-muted-foreground">
                            {`Input your domain  ${status === VerificationStatus.NO_DOMAIN && ownedDomains.length > 0
                ? 'or use previous'
                : ''}`}
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 flex-1">
                        <div className="flex gap-2">
                            <input_1.Input disabled={status !== VerificationStatus.NO_DOMAIN} value={domain} onChange={onDomainInputChange} placeholder="example.com" className="bg-background placeholder:text-muted-foreground" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    setupDomain();
                }
            }}/>
                            <button_1.Button onClick={() => {
                if (status === VerificationStatus.NO_DOMAIN) {
                    setupDomain();
                }
                else {
                    editDomain();
                }
            }} variant="secondary" size="sm" className="h-9 text-smallPlus" disabled={status === VerificationStatus.LOADING}>
                                {status === VerificationStatus.LOADING && (<icons_1.Icons.Shadow className="h-4 w-4 animate-spin mr-2"/>)}
                                {getInputButtonText()}
                            </button_1.Button>
                        </div>
                        {renderExistingDomains()}
                    </div>
                </div>
            </div>);
    }
    function renderConfigureHeader() {
        return (<div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <p className="text-regularPlus text-muted-foreground">Configure</p>
                        <p className="text-small text-muted-foreground">
                            Your DNS records must be set up with these values.
                        </p>
                    </div>
                    <button_1.Button variant="secondary" size="sm" className="h-8 px-3 text-sm" onClick={verifyDomain} disabled={status === VerificationStatus.LOADING}>
                        {status === VerificationStatus.LOADING && (<icons_1.Icons.Shadow className="h-4 w-4 animate-spin mr-2"/>)}
                        Verify Setup
                    </button_1.Button>
                </div>
            </div>);
    }
    function renderVerifiedHeader() {
        return (<div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <p className="text-regularPlus text-muted-foreground">Verified</p>
                        <p className="text-small text-muted-foreground">
                            Your domain is verified and ready to use.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <icons_1.Icons.CheckCircled className="h-4 w-4 text-green-500"/>
                            <span className="text-xs text-muted-foreground">Verified</span>
                        </div>
                        <dropdown_menu_1.DropdownMenu>
                            <dropdown_menu_1.DropdownMenuTrigger asChild>
                                <button_1.Button variant="ghost" size="icon">
                                    <icons_1.Icons.DotsVertical className="h-4 w-4"/>
                                </button_1.Button>
                            </dropdown_menu_1.DropdownMenuTrigger>
                            <dropdown_menu_1.DropdownMenuContent align="end">
                                <dropdown_menu_1.DropdownMenuItem className="hover:bg-muted focus:bg-muted cursor-pointer hidden">
                                    <icons_1.Icons.Reset className="mr-2 h-4 w-4"/>
                                    Reconfigure DNS
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuItem onClick={removeDomain} className="hover:bg-destructive/10 focus:bg-destructive/10 text-red-500 cursor-pointer">
                                    <icons_1.Icons.Trash className="mr-2 h-4 w-4"/>
                                    Remove Domain
                                </dropdown_menu_1.DropdownMenuItem>
                            </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                    </div>
                </div>
            </div>);
    }
    function renderRecords() {
        if (records.length === 0) {
            return null;
        }
        return (<div className="grid grid-cols-7 gap-4 rounded-lg border p-4">
                <div className="text-sm font-medium col-span-1">Type</div>
                <div className="text-sm font-medium col-span-3">Host</div>
                <div className="text-sm font-medium col-span-3">Value</div>

                {records.map((record) => (<>
                        <RecordField_1.RecordField value={record.type} className="col-span-1" copyable={false}/>
                        <RecordField_1.RecordField value={record.host} className="col-span-3"/>
                        <RecordField_1.RecordField value={record.value} className="col-span-3"/>
                    </>))}
            </div>);
    }
    return (<div className="space-y-4">
            {renderNoDomainInput()}
            {status === VerificationStatus.VERIFYING && renderConfigureHeader()}
            {status === VerificationStatus.VERIFIED && renderVerifiedHeader()}
            {(status === VerificationStatus.VERIFYING || status === VerificationStatus.VERIFIED) &&
            renderRecords()}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>);
});
//# sourceMappingURL=Verification.js.map