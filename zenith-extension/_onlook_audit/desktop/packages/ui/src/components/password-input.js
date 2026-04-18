"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordInput = void 0;
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const utils_1 = require("../utils");
const button_1 = require("./button");
const input_1 = require("./input");
const PasswordInput = (0, react_1.forwardRef)(({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const disabled = props.value === '' || props.value === undefined || props.disabled;
    return (<div className="relative">
            <input_1.Input type={showPassword ? 'text' : 'password'} className={(0, utils_1.cn)('hide-password-toggle pr-10', className)} ref={ref} {...props}/>
            <button_1.Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword((prev) => !prev)} disabled={disabled}>
                {showPassword && !disabled ? (<lucide_react_1.EyeIcon className="h-4 w-4" aria-hidden="true"/>) : (<lucide_react_1.EyeOffIcon className="h-4 w-4" aria-hidden="true"/>)}
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
            </button_1.Button>

            {/* hides browsers password toggles */}
            <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
        </div>);
});
exports.PasswordInput = PasswordInput;
PasswordInput.displayName = 'PasswordInput';
//# sourceMappingURL=password-input.js.map