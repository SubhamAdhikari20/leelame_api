// src/helpers/http-url.helper.ts

// 
export const normalizeRemoveHttpUrl = (url?: string | null) => {
    if (!url) {
        return null;
    }

    if (!(/^https?:\/\//.test(url))) {
        return url;
    }

    const base = process.env.BASE_URL?.trim().replace(/\/+$/, "");
    if (!base) {
        return url.startsWith("/") ? url : `/${url}`;
        // throw new Error("Missing backend api url!  Please set BASE_URL.");
    }

    let cleanUrl = url.replace(base, "");
    if (!cleanUrl.startsWith("/")) {
        cleanUrl = `/${cleanUrl}`;
    }

    // Remove any double slashes
    cleanUrl = cleanUrl.replace(/\/+/g, "/");

    // Remove trailing slash (optional, but cleaner for paths)
    cleanUrl = cleanUrl.replace(/\/$/, "");

    // const fullPath = `${url.replace(base, "").replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
    const fullPath = cleanUrl;
    // console.log(fullPath);

    return fullPath;
};