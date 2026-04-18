"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = getUserId;
exports.getUserById = getUserById;
exports.getUserByName = getUserByName;
exports.getMe = getMe;
exports.updateUser = updateUser;
exports.searchUsers = searchUsers;
async function getUserId(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('get_user_id', params);
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
async function getUserById(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('get_user_by_id', params);
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
async function getUserByName(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('get_user_by_name', params);
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
async function getMe(supabase) {
    try {
        const { error, data } = await supabase.rpc('get_me');
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
async function updateUser(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('update_user', params);
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
async function searchUsers(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('search_users', params);
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