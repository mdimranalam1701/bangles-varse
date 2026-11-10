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
    getById: (id) => API.get(`/orders/${id}`),
    reorder: (id) => API.post(`/orders/${id}/reorder`),
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
    markAsRead: (id) => API.patch(`/notifications/${id}/read`),
    markAllRead: () => API.patch("/notifications/read-all"),
    markAllAsRead: () => API.patch("/notifications/read-all"),
    delete: (id) => API.delete(`/notifications/${id}`),
};

export const wishlistAPI = {
    get: () => API.get("/wishlist"),
    toggle: (productId) => API.post(`/wishlist/toggle/${productId}`),
    remove: (productId) => API.delete(`/wishlist/remove/${productId}`),
    clear: () => API.delete("/wishlist/clear"),
    check: (productId) => API.get(`/wishlist/check/${productId}`),
};

export const addressAPI = {
    get: () => API.get("/addresses"),
    add: (data) => API.post("/addresses", data),
    update: (id, data) => API.put(`/addresses/${id}`, data),
    delete: (id) => API.delete(`/addresses/${id}`),
    setDefault: (id) => API.put(`/addresses/${id}/default`),
};

export const couponAPI = {
    getAll: () => API.get("/coupons"),
    create: (data) => API.post("/coupons", data),
    update: (id, data) => API.put(`/coupons/${id}`, data),
    delete: (id) => API.delete(`/coupons/${id}`),
    toggle: (id) => API.put(`/coupons/${id}/toggle`),
    validate: (data) => API.post("/coupons/validate", data),
};

export const announcementAPI = {
    getPublic: () => API.get("/announcements/public"),
    getAll: () => API.get("/announcements"),
    create: (data) => API.post("/announcements", data),
    update: (id, data) => API.put(`/announcements/${id}`, data),
    delete: (id) => API.delete(`/announcements/${id}`),
};

export const categoryAPI = {
    getPublic: () => API.get("/categories/public"),
    getAll: () => API.get("/categories"),
    create: (data) => API.post("/categories", data),
    update: (id, data) => API.put(`/categories/${id}`, data),
    delete: (id) => API.delete(`/categories/${id}`),
    toggle: (id) => API.put(`/categories/${id}/toggle`),
};

export const payoutAPI = {
    getAll: (params) => API.get("/payouts", { params }),
    create: (data) => API.post("/payouts", data),
    updateStatus: (id, data) => API.put(`/payouts/${id}/status`, data),
    getMy: () => API.get("/payouts/my"),
    getEarnings: () => API.get("/payouts/earnings"),
};

export const chatAPI = {
    startConversation: (data) => API.post("/chat/conversation", data),
    getConversations: () => API.get("/chat/conversations"),
    getUnreadCount: () => API.get("/chat/unread"),
    getMessages: (conversationId, params) => API.get(`/chat/${conversationId}/messages`, { params }),
    sendMessage: (conversationId, data) => API.post(`/chat/${conversationId}/messages`, data),
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
