"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountQuery = getAccountQuery;
exports.getUserAccountsQuery = getUserAccountsQuery;
async function getAccountQuery({ account_name }, supabase, signal) {
    if (!account_name) {
        throw new Error('account_name is required');
    }
    let query = supabase.from('account_registry').select('*').eq('account_name', account_name);
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
async function getUserAccountsQuery({ user_id }, supabase, signal) {
    if (!user_id) {
        throw new Error('user_id is required');
    }
    let query = supabase
        .from('account_registry')
        .select(`
        account_name,
        is_organization,
        ...organizations(
          ...users_on_organization()
        ),
        ...users()
      `)
        .or('users.id.eq.user_id, users_on_organization.user_id.eq.user_id');
    if (signal) {
        query = query.abortSignal(signal);
    }
    try {
        const { data, error } = await query.order('created_at', {
            ascending: false,
        });
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