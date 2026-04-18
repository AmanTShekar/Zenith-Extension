"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const webview_1 = require("@/lib/editor/engine/webview");
const models_1 = require("@/lib/models");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const clsx_1 = __importDefault(require("clsx"));
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const EnabledButton_1 = __importDefault(require("./EnabledButton"));
const BrowserControls = (0, mobx_react_lite_1.observer)(({ webviewRef, webviewSrc, setWebviewSrc, selected, hovered, setHovered, setDarkmode, settings, startMove, domState, webviewSize, }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [urlInputValue, setUrlInputValue] = (0, react_1.useState)(webviewSrc);
    const [editingURL, setEditingURL] = (0, react_1.useState)(false);
    const [theme, setTheme] = (0, react_1.useState)(constants_1.Theme.System);
    const [state, setState] = (0, react_1.useState)(webview_1.WebviewState.NOT_RUNNING);
    const [editorMode, setEditorMode] = (0, react_1.useState)(models_1.EditorMode.DESIGN);
    const inputRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const observer = (state) => {
            setState(state);
        };
        editorEngine.webviews.observeState(settings.id, observer);
        return editorEngine.webviews.unobserveState(settings.id, observer);
    });
    (0, react_1.useEffect)(() => {
        const observer = (newSettings) => {
            if (newSettings.theme !== theme) {
                setTheme(newSettings.theme || constants_1.DefaultSettings.THEME);
            }
        };
        editorEngine.canvas.observeSettings(settings.id, observer);
        return editorEngine.canvas.unobserveSettings(settings.id, observer);
    }, []);
    (0, react_1.useEffect)(() => {
        setEditorMode(editorEngine.mode);
    }, [editorEngine.mode]);
    (0, react_1.useEffect)(() => {
        setUrlInputValue(webviewSrc);
    }, [webviewSrc]);
    (0, react_1.useEffect)(() => {
        if (editingURL) {
            inputRef.current?.focus();
        }
    }, [editingURL]);
    function goForward() {
        const webview = webviewRef?.current;
        if (!webview) {
            return;
        }
        if (webview.canGoForward()) {
            webview.goForward();
        }
    }
    function reload() {
        const webview = webviewRef?.current;
        if (!webview) {
            return;
        }
        editorEngine.errors.clear();
        webview.reload();
    }
    function goBack() {
        const webview = webviewRef?.current;
        if (!webview) {
            return;
        }
        if (webview.canGoBack()) {
            webview.goBack();
        }
    }
    function handleKeydown(e) {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
            setEditingURL(false);
            return;
        }
    }
    function handleBlur(e) {
        const validUrl = (0, utility_1.getValidUrl)(e.currentTarget.value);
        setWebviewSrc(validUrl);
        setEditingURL(false);
    }
    async function changeTheme(theme) {
        const webview = webviewRef?.current;
        if (!webview) {
            return;
        }
        const themeValue = theme === constants_1.Theme.System ? 'device' : theme === constants_1.Theme.Dark ? 'dark' : 'light';
        webview.executeJavaScript(`window.api?.setTheme("${themeValue}")`).then((res) => {
            setDarkmode(res);
            setTheme(theme);
        });
        editorEngine.canvas.saveFrame(settings.id, {
            theme: theme,
        });
    }
    function canGoBack() {
        try {
            return webviewRef?.current?.canGoBack();
        }
        catch (e) {
            return false;
        }
    }
    function canGoForward() {
        try {
            return webviewRef?.current?.canGoForward();
        }
        catch (e) {
            return false;
        }
    }
    function getCleanURL(url) {
        try {
            const urlWithScheme = url.includes('://') ? url : 'http://' + url;
            const urlObject = new URL(urlWithScheme);
            const hostname = urlObject.hostname.replace(/^www\./, '');
            const port = urlObject.port ? ':' + urlObject.port : '';
            const path = urlObject.pathname + urlObject.search;
            return hostname + port + path;
        }
        catch (error) {
            console.error(error);
            return url;
        }
    }
    function handleSelect() {
        const webview = webviewRef?.current;
        if (!webview) {
            return;
        }
        editorEngine.webviews.deselectAll();
        editorEngine.webviews.select(webview);
        editorEngine.elements.clear();
    }
    function getSelectedColor() {
        if (editorEngine.mode === models_1.EditorMode.PREVIEW) {
            return 'text-blue-400 fill-blue-400';
        }
        if (domState === webview_1.WebviewState.DOM_ONLOOK_ENABLED) {
            return 'text-teal-400 fill-teal-400';
        }
        if (domState === webview_1.WebviewState.DOM_NO_ONLOOK) {
            return 'text-amber-400 fill-amber-400';
        }
        if (domState === webview_1.WebviewState.NOT_RUNNING && editorEngine.mode === models_1.EditorMode.DESIGN) {
            return 'text-foreground-secondary fill-foreground-secondary';
        }
        return '';
    }
    return (<div className={(0, clsx_1.default)('m-auto flex flex-row items-center backdrop-blur-sm overflow-hidden relative shadow-sm rounded-md border-input text-foreground', selected ? ' bg-active/60 ' : '', hovered ? ' bg-hover/20 ' : '', selected
            ? getSelectedColor()
            : editorMode === models_1.EditorMode.PREVIEW
                ? 'text-foreground-secondary fill-foreground-secondary'
                : 'fill-[#f7f7f7]')} onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)} onClick={handleSelect} style={{
            transform: `scale(${1 / editorEngine.canvas.scale})`,
            width: `${webviewSize.width * editorEngine.canvas.scale}px`,
            marginBottom: `${10 / editorEngine.canvas.scale}px`,
        }}>
                {/* Making sure the dropdown arrow is visible */}
                <div className="absolute right-0 bottom-0 top-0 bg-gradient-to-r from-transparent dark:via-background-primary via-background-tertiary dark:to-background-primary to-background-tertiary w-20 z-50"></div>
                <div className={`absolute left-0 flex flex-row z-50`} style={{
            transition: 'opacity 0.5s, transform 0.5s',
            transform: editingURL
                ? 'translateX(-100%)'
                : selected
                    ? 'translateX(0)'
                    : 'translateX(-100%)',
            opacity: editingURL ? 0 : selected ? 1 : 0,
        }}>
                    <button_1.Button size={'icon'} variant={'ghost'} onClick={goBack} disabled={!canGoBack()}>
                        <icons_1.Icons.ArrowLeft className="text-inherit h-4 w-4 transition-none"/>
                    </button_1.Button>

                    <button_1.Button size={'icon'} variant={'ghost'} onClick={goForward} style={{
            transition: 'display 0.5s',
            display: canGoForward() ? 'flex' : 'none',
        }}>
                        <icons_1.Icons.ArrowRight className="text-inherit h-4 w-4"/>
                    </button_1.Button>
                    <button_1.Button size={'icon'} variant={'ghost'} onClick={reload}>
                        {webviewRef?.current?.isLoading() ? (<icons_1.Icons.CrossL className="text-inherit"/>) : (<icons_1.Icons.Reload className="text-inherit"/>)}
                    </button_1.Button>
                </div>

                <div className={`relative w-full items-center flex flex-row min-h-9 cursor-pointer`} style={{
            transition: 'padding 0.5s',
            paddingLeft: selected && canGoForward()
                ? '7.25rem'
                : selected && editingURL
                    ? '0'
                    : selected
                        ? '5rem'
                        : '0',
            paddingRight: editingURL ? '0' : '5.625rem',
        }} onMouseDown={(e) => {
            if (e.target instanceof HTMLInputElement) {
                return;
            }
            if (editingURL) {
                setEditingURL(false);
                const validUrl = (0, utility_1.getValidUrl)(urlInputValue);
                setWebviewSrc(validUrl);
            }
            startMove(e);
        }} onDoubleClick={(e) => {
            if (e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLButtonElement ||
                e.target.closest('button')) {
                return;
            }
            setEditingURL(true);
        }}>
                    <input_1.Input ref={inputRef} className="text-small text-foreground-primary bg-background-secondary/60 w-full overflow-hidden text-ellipsis whitespace-nowrap min-w-[20rem] border-none focus:ring-0 focus:border-0 px-0 leading-none py-0 rounded-none" value={urlInputValue} onChange={(e) => setUrlInputValue(e.target.value)} onKeyDown={handleKeydown} onBlur={handleBlur} style={{
            transition: 'display 0.5s',
            display: editingURL ? 'flex' : 'none',
        }}/>
                    <button_1.Button className="absolute right-0.5 px-1 group" size={'icon'} variant={'ghost'} onClick={() => setEditingURL(false)} style={{
            transition: 'transform 0.5s, visibility 0.5s, opacity 0.5s',
            transform: editingURL ? 'translateX(0)' : 'translateX(-5.625rem)',
            visibility: editingURL ? 'visible' : 'hidden',
            opacity: editingURL ? 1 : 0,
        }}>
                        <icons_1.Icons.ArrowRight className="text-foreground-secondary group-hover:text-foreground-active h-4 w-4"/>
                    </button_1.Button>
                    <p className="text-small text-inherit hover:text-opacity-80 transition-colors px-0 h-auto leading-none py-0" style={{
            transition: 'display 0.5s',
            display: editingURL ? 'none' : 'flex',
        }}>
                        {getCleanURL(urlInputValue)}
                    </p>
                </div>

                <div className="absolute right-0 flex flex-row z-50" style={{
            transition: 'opacity 0.5s, transform 0.5s',
            transform: editingURL ? 'translateX(100%)' : 'translateX(0)',
            opacity: editingURL ? 0 : 1,
        }}>
                    <EnabledButton_1.default webviewId={settings.id}/>
                    <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button className={(0, utils_1.cn)('group transition-none', state === webview_1.WebviewState.DOM_ONLOOK_ENABLED && selected
            ? 'hover:text-teal-200 hover:bg-teal-400/10'
            : state === webview_1.WebviewState.DOM_NO_ONLOOK && selected
                ? 'hover:text-amber-200 hover:bg-amber-400/10'
                : '')} size={'icon'} variant={'ghost'}>
                                <icons_1.Icons.ChevronDown className="text-inherit h-4 w-4 rotate-0 group-data-[state=open]:-rotate-180 duration-200 ease-in-out"/>
                            </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent className="rounded-md bg-background">
                            <dropdown_menu_1.DropdownMenuItem asChild>
                                <button_1.Button variant={'ghost'} className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group" onClick={() => editorEngine.duplicateWindow(settings.id)}>
                                    <span className="flex w-full items-center text-smallPlus">
                                        <icons_1.Icons.Copy className="mr-2 h-4 w-4 text-foreground-secondary group-hover:text-foreground-active"/>
                                        <span>Duplicate Window</span>
                                    </span>
                                </button_1.Button>
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem asChild>
                                <button_1.Button variant={'ghost'} className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group" onClick={reload}>
                                    <span className="flex w-full items-center text-smallPlus">
                                        <icons_1.Icons.Reload className="mr-2 h-4 w-4 text-foreground-secondary group-hover:text-foreground-active"/>
                                        <span>Refresh Window</span>
                                    </span>
                                </button_1.Button>
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem asChild className="p-0">
                                <div className="flex flex-row hover:bg-transparent focus:bg-transparent w-full">
                                    <button_1.Button variant={'ghost'} className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group" onClick={goBack} disabled={!canGoBack()}>
                                        <icons_1.Icons.ArrowLeft className="mr-2 h-4 w-4 text-foreground-secondary group-hover:text-foreground-active"/>{' '}
                                        Back
                                    </button_1.Button>
                                    <button_1.Button variant={'ghost'} className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group" onClick={goForward} disabled={!canGoForward()}>
                                        <span className="flex w-full items-center text-smallPlus">
                                            <span>Next</span>
                                            <icons_1.Icons.ArrowRight className="ml-2 h-4 w-4 text-foreground-secondary group-hover:text-foreground-active"/>
                                        </span>
                                    </button_1.Button>
                                </div>
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem asChild className="p-0">
                                <div className="flex flex-row hover:bg-transparent focus:bg-transparent w-full">
                                    <button_1.Button size={'icon'} variant={'ghost'} className={`hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group ${theme === constants_1.Theme.System ? 'bg-background-tertiary' : ''}`} onClick={() => changeTheme(constants_1.Theme.System)}>
                                        <icons_1.Icons.Laptop className={`${theme === constants_1.Theme.System ? 'text-foreground-active' : 'text-foreground-secondary'} group-hover:text-foreground-active`}/>
                                    </button_1.Button>
                                    <button_1.Button size={'icon'} variant={'ghost'} className={`hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group ${theme === constants_1.Theme.Dark ? 'bg-background-tertiary' : ''}`} onClick={() => changeTheme(constants_1.Theme.Dark)}>
                                        <icons_1.Icons.Moon className={`${theme === constants_1.Theme.Dark ? 'text-foreground-active' : 'text-foreground-secondary'} group-hover:text-foreground-active`}/>
                                    </button_1.Button>
                                    <button_1.Button size={'icon'} variant={'ghost'} className={`hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group ${theme === constants_1.Theme.Light ? 'bg-background-tertiary' : ''}`} onClick={() => changeTheme(constants_1.Theme.Light)}>
                                        <icons_1.Icons.Sun className={`${theme === constants_1.Theme.Light ? 'text-foreground-active' : 'text-foreground-secondary'} group-hover:text-foreground-active`}/>
                                    </button_1.Button>
                                </div>
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem asChild>
                                <button_1.Button variant={'ghost'} className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group" onClick={() => editorEngine.deleteWindow(settings.id)} disabled={!editorEngine.canDeleteWindow()}>
                                    <span className="flex w-full items-center">
                                        <icons_1.Icons.Trash className="mr-2 h-4 w-4 text-foreground-secondary group-hover:text-foreground-active"/>
                                        <span>
                                            {editorEngine.canDeleteWindow()
            ? 'Delete Window'
            : "Can't delete this!"}
                                        </span>
                                    </span>
                                </button_1.Button>
                            </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>
                </div>
            </div>);
});
exports.default = BrowserControls;
//# sourceMappingURL=index.js.map