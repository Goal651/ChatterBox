export const authHeaders = (token?: string | null) => ({
    headers: {
        accesstoken: token || localStorage.getItem("token") || "",
    },
});

export const fileHeaders = (token?: string | null) => ({
    headers: {
        accesstoken: token || localStorage.getItem("token") || "",
        "Content-Type": "multipart/form-data",
    },
});