import axios from "axios";

export const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const API = axios.create({
    baseURL: `${API_ORIGIN}/api`,
    timeout: 15000,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && localStorage.getItem("token")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(err);
    }
);

export const resolveAssetUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
        return url;
    }
    if (url.startsWith("/uploads/") && API_ORIGIN) {
        return `${API_ORIGIN}${url}`;
    }
    return url;
};

export const configAPI = {
    getPublic: () => API.get("/config"),
    health: () => API.get("/health"),
};

export const authAPI = {
    register: (data) => API.post("/auth/register", data),
    login: (data) => API.post("/auth/login", data),
    getProfile: () => API.get("/auth/profile"),
    updateProfile: (data) => API.put("/auth/profile", data),
};

export const productAPI = {
    getAll: (params) => API.get("/products", { params }),
    getById: (id) => API.get(`/products/${id}`),
    getCategorySummary: () => API.get("/products/categories/summary"),
    getOwnerProducts: () => API.get("/products/owner"),
    create: (data) => API.post("/products", data),
    update: (id, data) => API.put(`/products/${id}`, data),
    delete: (id) => API.delete(`/products/${id}`),
};

export const cartAPI = {
    get: () => API.get("/cart"),
    add: (data) => API.post("/cart", data),
    update: (data) => API.patch("/cart", data),
    remove: (productId, size) =>
        API.delete(`/cart/${productId}`, { params: size ? { size } : {} }),
    clear: () => API.delete("/cart"),
};

export const orderAPI = {
    create: (data, idempotencyKey) =>
        API.post("/orders", data, {
            headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
        }),
    createQuick: (data, idempotencyKey) =>
        API.post("/orders/quick", data, {
            headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
        }),
    track: (params) => API.get("/orders/track", { params }),
    getMy: () => API.get("/orders/my"),
    getOwnerOrders: () => API.get("/orders/owner"),
    getAll: () => API.get("/orders"),
    updateStatus: (id, data) => API.patch(`/orders/${id}/status`, data),
    cancel: (id) => API.patch(`/orders/${id}/cancel`),
};

export const paymentAPI = {
    createOrder: (data) => API.post("/payments/create-order", data),
    verify: (data) => API.post("/payments/verify", data),
};

export const reviewAPI = {
    add: (productId, data) => API.post(`/reviews/${productId}`, data),
    get: (productId) => API.get(`/reviews/${productId}`),
};

export const creditAPI = {
    getMyAll: () => API.get("/credit/my"),
    getOwnerLedgers: () => API.get("/credit/owner/ledgers"),
    settleCustomer: (data) => API.post("/credit/owner/settle", data),
    add: (data) => API.post("/credit/add", data),
    pay: (ownerId, data) => API.post(`/credit/pay/${ownerId}`, data),
    get: (ownerId) => API.get(`/credit/${ownerId}`),
};

export const notificationAPI = {
    get: () => API.get("/notifications"),
    markRead: (id) => API.patch(`/notifications/${id}/read`),
    markAllRead: () => API.patch("/notifications/read-all"),
};

export const transactionAPI = {
    getMy: () => API.get("/transaction/my"),
    getOwnerTransactions: () => API.get("/transaction/owner"),
    getAll: () => API.get("/transaction"),
};

export const dashboardAPI = {
    getOwner: () => API.get("/dashboard/owner"),
};

export const adminAPI = {
    getStats: () => API.get("/admin/stats"),
    getAllUsers: () => API.get("/admin/users"),
    getUsersByRole: (role) => API.get(`/admin/users/role/${role}`),
    approveOwner: (id) => API.put(`/admin/users/${id}/approve`),
    rejectOwner: (id) => API.put(`/admin/users/${id}/reject`),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export const uploadAPI = {
    image: (formData) =>
        API.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
};

export default API;
