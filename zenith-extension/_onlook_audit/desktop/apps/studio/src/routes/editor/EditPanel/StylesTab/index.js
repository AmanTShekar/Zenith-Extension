"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylesTab = void 0;
const Context_1 = require("@/components/Context");
const style_1 = require("@/lib/editor/engine/style");
const group_1 = require("@/lib/editor/styles/group");
const models_1 = require("@/lib/editor/styles/models");
const accordion_1 = require("@onlook/ui/accordion");
const index_1 = require("@onlook/ui/icons/index");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const BorderInput_1 = __importDefault(require("./compound/BorderInput"));
const DisplayInput_1 = __importDefault(require("./compound/DisplayInput"));
const FillInput_1 = __importDefault(require("./compound/FillInput"));
const NestedInputs_1 = __importDefault(require("./compound/NestedInputs"));
const PositionInput_1 = __importDefault(require("./compound/PositionInput"));
const AutoLayoutInput_1 = __importDefault(require("./single/AutoLayoutInput"));
const ColorInput_1 = __importDefault(require("./single/ColorInput"));
const NumberUnitInput_1 = __importDefault(require("./single/NumberUnitInput"));
const SelectInput_1 = __importDefault(require("./single/SelectInput"));
const TagDetails_1 = __importDefault(require("./single/TagDetails"));
const TailwindInput_1 = __importDefault(require("./single/TailwindInput"));
const TextInput_1 = __importDefault(require("./single/TextInput"));
const FontInput_1 = require("./single/FontInput");
const STYLE_GROUP_MAPPING = {
    [models_1.StyleGroupKey.Position]: group_1.PositionGroup,
    [models_1.StyleGroupKey.Layout]: group_1.LayoutGroup,
    [models_1.StyleGroupKey.Style]: group_1.StyleGroup,
    [models_1.StyleGroupKey.Text]: group_1.TextGroup,
};
const SingleInput = (0, react_1.memo)(({ style }) => {
    if (style.type === models_1.StyleType.Select) {
        return <SelectInput_1.default elementStyle={style}/>;
    }
    else if (style.type === models_1.StyleType.Dimensions) {
        return <AutoLayoutInput_1.default elementStyle={style}/>;
    }
    else if (style.type === models_1.StyleType.Color) {
        return <ColorInput_1.default elementStyle={style}/>;
    }
    else if (style.type === models_1.StyleType.Number) {
        return <NumberUnitInput_1.default elementStyle={style}/>;
    }
    else if (style.type === models_1.StyleType.Text) {
        return <TextInput_1.default elementStyle={style}/>;
    }
    else if (style.type === models_1.StyleType.Font) {
        return <FontInput_1.FontInput elementStyle={style}/>;
    }
    return (<div className="flex flex-row items-center">
            <p>Unknown style: {style.key}</p>
        </div>);
});
SingleInput.displayName = 'SingleInput';
const SingleStyle = (0, react_1.memo)(({ style }) => {
    const { t } = (0, react_i18next_1.useTranslation)();
    return (<div className="flex flex-row items-center mt-2">
            <p className="text-xs w-24 mr-2 text-start text-foreground-onlook">
                {t(style.displayName)}
            </p>
            <div className="text-end ml-auto">
                <SingleInput style={style}/>
            </div>
        </div>);
});
SingleStyle.displayName = 'SingleStyle';
const CompoundStyle = (0, react_1.memo)(({ style }) => {
    if ([models_1.CompoundStyleKey.Margin, models_1.CompoundStyleKey.Padding, models_1.CompoundStyleKey.Corners].includes(style.key)) {
        return <NestedInputs_1.default compoundStyle={style}/>;
    }
    else if (style.key === models_1.CompoundStyleKey.Display) {
        return <DisplayInput_1.default compoundStyle={style}/>;
    }
    else if (style.key === models_1.CompoundStyleKey.Border) {
        return <BorderInput_1.default compoundStyle={style}/>;
    }
    else if (style.key === models_1.CompoundStyleKey.Fill) {
        return <FillInput_1.default compoundStyle={style}/>;
    }
    else if (style.key === models_1.CompoundStyleKey.Position) {
        return <PositionInput_1.default compoundStyle={style}/>;
    }
    else {
        return (<div className="flex flex-row items-center">
                <p>Unknown compound style: {style.key}</p>
            </div>);
    }
});
CompoundStyle.displayName = 'CompoundStyle';
const StyleGroupComponent = (0, react_1.memo)(({ baseElementStyles }) => {
    return (<>
            {Object.entries(baseElementStyles).map(([key, value]) => (<div key={key}>
                    {value.elStyleType === 'compound' ? (<CompoundStyle style={value}/>) : (<SingleStyle style={value}/>)}
                </div>))}
        </>);
});
StyleGroupComponent.displayName = 'StyleGroupComponent';
const AccordionHeader = (0, mobx_react_lite_1.observer)(({ groupKey }) => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const editorEngine = (0, Context_1.useEditorEngine)();
    return (<tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild disabled={editorEngine.style.mode !== style_1.StyleMode.Instance}>
                <div className={(0, utils_1.cn)('text-xs flex transition-all items-center group', editorEngine.style.mode === style_1.StyleMode.Instance &&
            'gap-1 text-purple-600 dark:text-purple-300 hover:text-purple-500 dark:hover:text-purple-200')}>
                    <index_1.Icons.ComponentInstance className={(0, utils_1.cn)('transition-all w-0', editorEngine.style.mode === style_1.StyleMode.Instance &&
            'w-3 h-3 text-purple-600 dark:text-purple-300 group-hover:text-purple-500 dark:group-hover:text-purple-200')}/>
                    {t(`editor.panels.edit.tabs.styles.groups.${groupKey.toLowerCase()}`)}
                </div>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipPortal container={document.getElementById('style-tab-id')}>
                <tooltip_1.TooltipContent className={`${editorEngine.style.mode !== style_1.StyleMode.Instance ? 'hidden' : ''}`}>
                    {t('editor.panels.edit.tabs.styles.tailwind.instanceClasses.tooltip')}
                </tooltip_1.TooltipContent>
            </tooltip_1.TooltipPortal>
        </tooltip_1.Tooltip>);
});
AccordionHeader.displayName = 'AccordionHeader';
const TailwindSection = (0, react_1.memo)(() => {
    const { t } = (0, react_i18next_1.useTranslation)();
    return (<accordion_1.AccordionItem value="tw">
            <accordion_1.AccordionTrigger>
                <h2 className="text-xs">{t('editor.panels.edit.tabs.styles.tailwind.title')}</h2>
            </accordion_1.AccordionTrigger>
            <accordion_1.AccordionContent>
                <TailwindInput_1.default />
            </accordion_1.AccordionContent>
        </accordion_1.AccordionItem>);
});
TailwindSection.displayName = 'TailwindSection';
const StyleSections = (0, react_1.memo)(() => {
    return Object.entries(STYLE_GROUP_MAPPING).map(([groupKey, baseElementStyles]) => (<accordion_1.AccordionItem key={groupKey} value={groupKey}>
            <accordion_1.AccordionTrigger className="mb-[-4px] mt-[-2px]">
                <AccordionHeader groupKey={groupKey}/>
            </accordion_1.AccordionTrigger>
            <accordion_1.AccordionContent className="mt-2px">
                {groupKey === models_1.StyleGroupKey.Text && <TagDetails_1.default />}
                <StyleGroupComponent baseElementStyles={baseElementStyles}/>
            </accordion_1.AccordionContent>
        </accordion_1.AccordionItem>));
});
StyleSections.displayName = 'StyleSections';
exports.StylesTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    (0, react_1.useEffect)(() => {
        editorEngine.theme.scanConfig();
        editorEngine.font.scanFonts();
    }, []);
    return (editorEngine.elements.selected.length > 0 &&
        editorEngine.style.selectedStyle && (<accordion_1.Accordion className="px-3" type="multiple" defaultValue={[...Object.values(models_1.StyleGroupKey), 'tw']}>
                <TailwindSection />
                <StyleSections />
            </accordion_1.Accordion>));
});
//# sourceMappingURL=index.js.map