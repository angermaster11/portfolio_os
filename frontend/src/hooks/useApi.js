const API_BASE = "/api";

export async function api(endpoint, options = {}) {
    const token = localStorage.getItem("portfolio_token");

    const headers = {
        ...(options.headers || {})
    };

    // Don't set Content-Type for FormData (browser sets multipart boundary)
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

export function apiGet(endpoint) {
    return api(endpoint, { method: "GET" });
}

export function apiPost(endpoint, body) {
    if (body instanceof FormData) {
        return api(endpoint, { method: "POST", body });
    }

    return api(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
    });
}

export function apiPut(endpoint, body) {
    return api(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
    });
}

export function apiDelete(endpoint) {
    return api(endpoint, { method: "DELETE" });
}
