"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserQuery = getUserQuery;
async function getUserQuery({ user_id }, supabase, signal) {
    if (!user_id) {
        throw new Error('user_id is required');
    }
    let query = supabase
        .from('users')
        .select(`
      *,
      organizations (id, account_name, avatar_url)
    `)
        .eq('id', user_id);
    if (signal) {
        query = query.abortSignal(signal);
    }
    try {
        const { data, error } = await query.maybeSingle();
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