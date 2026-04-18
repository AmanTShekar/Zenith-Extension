"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const icons_1 = require("@onlook/ui/icons");
const NodeIcon = ({ iconClass, tagName: preprocessedTagName }) => {
    const tagName = preprocessedTagName.toUpperCase();
    if (tagName === 'H1') {
        return <icons_1.Icons.H1 className={iconClass}/>;
    }
    else if (tagName === 'H2') {
        return <icons_1.Icons.H2 className={iconClass}/>;
    }
    else if (tagName === 'H3') {
        return <icons_1.Icons.H3 className={iconClass}/>;
    }
    else if (tagName === 'H4') {
        return <icons_1.Icons.H4 className={iconClass}/>;
    }
    else if (tagName === 'H5') {
        return <icons_1.Icons.H5 className={iconClass}/>;
    }
    else if (tagName === 'H6') {
        return <icons_1.Icons.H6 className={iconClass}/>;
    }
    else if (tagName === 'P') {
        return <icons_1.Icons.Pilcrow className={iconClass}/>;
    }
    else if (['STRONG', 'EM', 'SPAN', 'I'].includes(tagName)) {
        return <icons_1.Icons.Text className={iconClass}/>;
    }
    else if (tagName === 'A') {
        return <icons_1.Icons.Link className={iconClass}/>;
    }
    else if (['IMG', 'SVG'].includes(tagName)) {
        return <icons_1.Icons.Image className={iconClass}/>;
    }
    else if (tagName === 'VIDEO') {
        return <icons_1.Icons.Video className={iconClass}/>;
    }
    else if (tagName === 'IFRAME') {
        return <icons_1.Icons.Frame className={iconClass}/>;
    }
    else if (tagName === 'BUTTON') {
        return <icons_1.Icons.Button className={iconClass}/>;
    }
    else if (tagName === 'INPUT') {
        return <icons_1.Icons.Input className={iconClass}/>;
    }
    else if (['UL', 'OL'].includes(tagName)) {
        return <icons_1.Icons.ListBullet className={iconClass}/>;
    }
    else if (tagName === 'SECTION') {
        return <icons_1.Icons.Section className={iconClass}/>;
    }
    else if (tagName === 'DIV') {
        return <icons_1.Icons.Box className={iconClass}/>;
    }
    else if (['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD'].includes(tagName)) {
        return <icons_1.Icons.ViewGrid className={iconClass}/>;
    }
    else if (tagName === 'FORM') {
        return <icons_1.Icons.ViewHorizontal className={iconClass}/>;
    }
    else if (['SELECT', 'OPTION'].includes(tagName)) {
        return <icons_1.Icons.DropdownMenu className={iconClass}/>;
    }
    else if (tagName === 'TEXTAREA') {
        return <icons_1.Icons.ViewVertical className={iconClass}/>;
    }
    else if (tagName === 'CANVAS') {
        return <icons_1.Icons.PencilPaper className={iconClass}/>;
    }
    else if (tagName === 'BODY') {
        return <icons_1.Icons.Desktop className={iconClass}/>;
    }
    else {
        return <icons_1.Icons.Frame className={iconClass}/>;
    }
};
exports.default = NodeIcon;
//# sourceMappingURL=NodeIcon.js.map