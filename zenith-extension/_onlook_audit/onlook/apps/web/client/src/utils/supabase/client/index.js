"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBlobToStorage = exports.getFileInfoFromStorage = exports.getFileUrlFromStorage = void 0;
exports.createClient = createClient;
const env_1 = require("@/env");
const ssr_1 = require("@supabase/ssr");
function createClient() {
    // Create a supabase client on the browser with project's credentials
    return (0, ssr_1.createBrowserClient)(env_1.env.NEXT_PUBLIC_SUPABASE_URL, env_1.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
const getFileUrlFromStorage = (bucket, path) => {
    const supabase = createClient();
    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
    return data.publicUrl;
};
exports.getFileUrlFromStorage = getFileUrlFromStorage;
const getFileInfoFromStorage = async (bucket, path) => {
    const supabase = createClient();
    const { data, error } = await supabase.storage
        .from(bucket).info(path);
    if (error) {
        console.error('Error getting file info:', error);
        return null;
    }
    return data;
};
exports.getFileInfoFromStorage = getFileInfoFromStorage;
const uploadBlobToStorage = async (bucket, path, file, options) => {
    const supabase = createClient();
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, options);
    if (error) {
        console.error('Error uploading file:', error);
        return null;
    }
    return data;
};
exports.uploadBlobToStorage = uploadBlobToStorage;
//# sourceMappingURL=index.js.map