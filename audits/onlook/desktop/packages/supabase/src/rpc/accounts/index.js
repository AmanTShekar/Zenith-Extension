"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountsState = getAccountsState;
async function getAccountsState(supabase) {
    try {
        const { error, data } = await supabase.rpc('get_accounts_state');
        if (error) {
            throw error;
        }
        if (data) {
            return data;
        }
    }
    catch (error) {
        console.error(error);
    }
}
//# sourceMappingURL=index.js.map