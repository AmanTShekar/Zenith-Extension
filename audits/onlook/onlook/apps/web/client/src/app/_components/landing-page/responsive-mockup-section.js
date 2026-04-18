"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsiveMockupSection = ResponsiveMockupSection;
const react_1 = __importDefault(require("react"));
const onlook_interface_mockup_1 = require("./onlook-interface-mockup");
function ResponsiveMockupSection() {
    return (<>
      {/* Desktop/Tablet View - Full Mockup */}
      <div className="hidden md:block w-screen h-[44rem] flex items-center justify-center" id="features">
        <onlook_interface_mockup_1.OnlookInterfaceMockup />
      </div>

      {/* Mobile View - Split into two sections */}
      <div className="md:hidden">
        {/* First Section - Right half of mockup (chat panel focused) */}
        <div className="w-screen relative overflow-hidden flex flex-col items-center justify-center py-14" id="features-mobile-1">
          {/* Original mockup positioned to show right side */}
          <div className="absolute top-1/2 right-10 transform -translate-y-1/2 h-[800px] w-[1000px]">
            <onlook_interface_mockup_1.OnlookInterfaceMockup />
          </div>
          
          {/* Text section - positioned below mockup */}
          <div className="mt-[700px] px-8 text-left">
            <h2 className="text-2xl md:text-4xl font-light text-foreground-primary leading-tight mb-4 text-balance">
              Design with AI on an infinite canvas
            </h2>
            <p className="text-large text-foreground-secondary leading-relaxed text-balance">
              Craft, preview, and iterate with AI to ship better websites and prototypes faster than ever.
            </p>
          </div>
        </div>

        {/* Second Section - Left half of mockup (layers/design tools focused) */}
        <div className="w-screen relative overflow-hidden flex flex-col items-center justify-center py-14" id="features-mobile-2">
          {/* Original mockup positioned to show left side */}
          <div className="absolute top-1/2 left-10 transform -translate-y-1/2 h-[800px] w-[1000px]">
            <onlook_interface_mockup_1.OnlookInterfaceMockup />
          </div>
          
          {/* Text section - positioned below mockup */}
          <div className="mt-[700px] px-8 text-left">
            <h2 className="text-2xl md:text-4xl font-light text-foreground-primary leading-tight mb-4 text-balance">
              Native design tool features that work 1:1 with code.
            </h2>
            <p className="text-large text-foreground-secondary leading-relaxed text-balance">
              A true developer tool for designers, helping you code without knowing anything about code.
            </p>
          </div>
        </div>
      </div>
    </>);
}
//# sourceMappingURL=responsive-mockup-section.js.map