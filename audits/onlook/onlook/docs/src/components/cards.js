"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cards = Cards;
function Cards({ children, className }) {
    return (<div className={className ?? "grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}>
      {children}
    </div>);
}
//# sourceMappingURL=cards.js.map