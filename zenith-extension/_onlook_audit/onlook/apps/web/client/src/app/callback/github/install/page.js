"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GitHubInstallCallbackPage;
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const icons_1 = require("@onlook/ui/icons");
const react_2 = require("motion/react");
const navigation_1 = require("next/navigation");
const react_3 = require("react");
function GitHubInstallCallbackPage() {
    const router = (0, navigation_1.useRouter)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const [state, setState] = (0, react_3.useState)('loading');
    const [message, setMessage] = (0, react_3.useState)('');
    const handleInstallationCallback = react_1.api.github.handleInstallationCallbackUrl.useMutation();
    (0, react_3.useEffect)(() => {
        const installationId = searchParams.get('installation_id');
        const setupAction = searchParams.get('setup_action');
        const stateParam = searchParams.get('state');
        console.log('GitHub installation callback:', { installationId, setupAction, state: stateParam });
        if (!installationId) {
            setState('error');
            setMessage('Missing installation_id parameter');
            return;
        }
        if (!setupAction) {
            setState('error');
            setMessage('Missing setup_action parameter');
            return;
        }
        if (!stateParam) {
            setState('error');
            setMessage('Missing state parameter');
            return;
        }
        // Call the TRPC mutation to handle the callback
        handleInstallationCallback.mutate({
            installationId,
            setupAction: setupAction,
            state: stateParam,
        }, {
            onSuccess: (data) => {
                setState('success');
                setMessage(data.message);
                console.log('GitHub App installation completed:', data);
                setTimeout(() => {
                    // Close the tab since we are using a new tab
                    window.close();
                }, 3000);
            },
            onError: (error) => {
                setState('error');
                setMessage(error.message);
                console.error('GitHub App installation callback failed:', error);
            },
        });
    }, []);
    const StateContainer = ({ indicatorColor, indicatorIcon: IndicatorIcon, indicatorAnimated = false, iconAnimated = false, title, description, isError = false, actions }) => (<div className="flex flex-col items-center gap-2 w-full">
            {iconAnimated ? (<react_2.motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                    <div className={`relative w-16 h-16 rounded-full ${indicatorColor} flex items-center justify-center mb-2`}>
                        {indicatorAnimated && (<div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white/30 animate-spin"/>)}
                        <IndicatorIcon className="w-8 h-8 text-white"/>
                    </div>
                </react_2.motion.div>) : (<div className={`relative w-16 h-16 rounded-full ${indicatorColor} flex items-center justify-center mb-2`}>
                    {indicatorAnimated && (<div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white/30 animate-spin"/>)}
                    <IndicatorIcon className="w-8 h-8 text-white"/>
                </div>)}
            <card_1.CardTitle className="text-xl text-foreground-primary">
                {title}
            </card_1.CardTitle>
            <card_1.CardDescription className={`max-w-sm ${isError ? 'text-gray-400' : 'text-foreground-secondary/90'}`}>
                {description}
            </card_1.CardDescription>
            {actions}
        </div>);
    return (<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
            <div className="w-full max-w-md">
                {/* Header - Above Card */}
                <div className="flex items-center gap-4 mb-8 justify-center">
                    <div className="p-4 bg-gray-800 rounded-xl">
                        <icons_1.Icons.OnlookLogo className="w-8 h-8 text-white"/>
                    </div>
                    <icons_1.Icons.DotsHorizontal className="w-8 h-8 text-gray-400"/>
                    <div className="p-4 bg-gray-800 rounded-xl">
                        <icons_1.Icons.GitHubLogo className="w-8 h-8 text-white"/>
                    </div>
                </div>

                <react_2.AnimatePresence mode="wait">
                    <react_2.motion.div key={state} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        <card_1.Card className="bg-gray-900 border-gray-800 shadow-2xl">
                            <card_1.CardContent className="p-8">
                                <div className="flex flex-col items-center text-center">
                                    {/* Loading State */}
                                    {state === 'loading' && (<StateContainer indicatorColor="bg-gray-800" indicatorIcon={icons_1.Icons.GitHubLogo} indicatorAnimated={true} title="Connecting to GitHub" description="We're setting up your integration"/>)}

                                    {/* Success State */}
                                    {state === 'success' && (<StateContainer indicatorColor="bg-green-500" indicatorIcon={icons_1.Icons.CheckCircled} iconAnimated={true} title="All set!" description="Your GitHub account is now connected"/>)}

                                    {/* Error State */}
                                    {state === 'error' && (<StateContainer indicatorColor="bg-red-500" indicatorIcon={icons_1.Icons.ExclamationTriangle} iconAnimated={true} title="Something went wrong" description={message} isError={true} actions={<div className="flex flex-col gap-3 w-full">
                                                    <button_1.Button variant="default" onClick={() => window.location.reload()} className="w-full">
                                                        Try Again
                                                    </button_1.Button>
                                                    <button_1.Button variant="outline" onClick={() => router.push(constants_1.Routes.IMPORT_GITHUB)} className="w-full">
                                                        Return to Import
                                                    </button_1.Button>
                                                </div>}/>)}
                                </div>
                            </card_1.CardContent>
                        </card_1.Card>
                    </react_2.motion.div>
                </react_2.AnimatePresence>
            </div>
        </div>);
}
//# sourceMappingURL=page.js.map