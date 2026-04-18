"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllVariants = exports.WithIcon = exports.Outline = exports.Destructive = exports.Default = void 0;
const button_1 = require("@onlook/ui/button");
const lucide_react_1 = require("lucide-react");
const meta = {
    title: 'UI/Button',
    component: button_1.Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'icon', 'toolbar'],
        },
        asChild: {
            control: 'boolean',
        },
    },
};
exports.default = meta;
exports.Default = {
    args: {
        children: 'Button',
        variant: 'default',
        size: 'default',
    },
};
exports.Destructive = {
    args: {
        children: 'Delete',
        variant: 'destructive',
    },
};
exports.Outline = {
    args: {
        children: 'Outline',
        variant: 'outline',
    },
};
exports.WithIcon = {
    args: {
        children: (<>
                <lucide_react_1.Plus />
                Add Item
            </>),
        variant: 'default',
    },
};
exports.AllVariants = {
    render: () => (<div className="flex flex-col gap-4">
            <div className="flex gap-2 items-center">
                <button_1.Button variant="default">Default</button_1.Button>
                <button_1.Button variant="destructive">Destructive</button_1.Button>
                <button_1.Button variant="outline">Outline</button_1.Button>
                <button_1.Button variant="secondary">Secondary</button_1.Button>
                <button_1.Button variant="ghost">Ghost</button_1.Button>
                <button_1.Button variant="link">Link</button_1.Button>
            </div>
            <div className="flex gap-2 items-center">
                <button_1.Button size="sm">Small</button_1.Button>
                <button_1.Button size="default">Default</button_1.Button>
                <button_1.Button size="lg">Large</button_1.Button>
                <button_1.Button size="icon">
                    <lucide_react_1.Heart />
                </button_1.Button>
                <button_1.Button size="toolbar" variant="ghost">
                    <lucide_react_1.Trash2 />
                </button_1.Button>
            </div>
        </div>),
};
//# sourceMappingURL=Button.stories.js.map