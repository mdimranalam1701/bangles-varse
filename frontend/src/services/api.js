import axios from "axios";

const API = axios.create({
    baseURL: "/api",
});

// Attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors globally
API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(err);
    }
);

// ── Auth ──────────────────────────────────────────
export const authAPI = {
    register: (data) => API.post("/auth/register", data),
    login: (data) => API.post("/auth/login", data),
    getProfile: () => API.get("/auth/profile"),
    updateProfile: (data) => API.put("/auth/profile", data),
};

// ── Products ──────────────────────────────────────
export const productAPI = {
    getAll: (params) => API.get("/products", { params }),
    getOwnerProducts: () => API.get("/products/owner"),
    create: (data) => API.post("/products", data),
    update: (id, data) => API.put(`/products/${id}`, data),
    delete: (id) => API.delete(`/products/${id}`),
};

// ── Cart ──────────────────────────────────────────
export const cartAPI = {
    get: () => API.get("/cart"),
    add: (data) => API.post("/cart", data),
    remove: (productId) => API.delete(`/cart/${productId}`),
};

// ── Orders ────────────────────────────────────────
export const orderAPI = {
    create: (data) => API.post("/orders", data),
    getMy: () => API.get("/orders/my"),
    getOwnerOrders: () => API.get("/orders/owner"),
    getAll: () => API.get("/orders"),
    getById: (id) => API.get(`/orders/${id}`),
    updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
    updateTracking: (id, data) => API.put(`/orders/${id}/tracking`, data),
    requestReturn: (id, data) => API.post(`/orders/${id}/return`, data),
    handleReturn: (id, data) => API.put(`/orders/${id}/return`, data),
    reorder: (id) => API.post(`/orders/${id}/reorder`),
};

// ── Payments (Razorpay) ──────────────────────────
export const paymentAPI = {
    createOrder: (data) => API.post("/payments/create-order", data),
    verify: (data) => API.post("/payments/verify", data),
};

// ── Reviews ───────────────────────────────────────
export const reviewAPI = {
    add: (productId, data) => API.post(`/reviews/${productId}`, data),
    get: (productId) => API.get(`/reviews/${productId}`),
};

// ── Credit ────────────────────────────────────────
export const creditAPI = {
    requestApproval: (data) => API.post("/credit/request-approval", data),
    getApprovalStatus: (ownerId) => API.get(`/credit/approval-status/${ownerId}`),
    approveCredit: (approvalId) => API.put(`/credit/approve/${approvalId}`),
    getApprovals: () => API.get("/credit/approvals"),
    add: (data) => API.post("/credit/add", data),
    pay: (data) => API.post(`/credit/pay`, data),
    customerPay: (data) => API.post("/credit/customer-pay", data),
    get: (ownerId) => API.get(`/credit/${ownerId}`),
    getCustomerAll: () => API.get("/credit/customer-all"),
    getOwnerAll: () => API.get("/credit/owner-all"),
};

// ── Notifications ─────────────────────────────────
export const notificationAPI = {
    get: () => API.get("/notifications"),
    getUnreadCount: () => API.get("/notifications/unread-count"),
    markAsRead: (id) => API.put(`/notifications/${id}/read`),
    markAllAsRead: () => API.put("/notifications/read-all"),
    delete: (id) => API.delete(`/notifications/${id}`),
};

// ── Transactions ──────────────────────────────────
export const transactionAPI = {
    getMy: () => API.get("/transaction/my"),
    getOwnerTransactions: () => API.get("/transaction/owner"),
    getAll: () => API.get("/transaction"),
};

// ── Dashboard ─────────────────────────────────────
export const dashboardAPI = {
    getOwner: () => API.get("/dashboard/owner"),
};

// ── Admin ─────────────────────────────────────────
export const adminAPI = {
    getStats: () => API.get("/admin/stats"),
    getAllUsers: () => API.get("/admin/users"),
    getUsersByRole: (role) => API.get(`/admin/users/role/${role}`),
    approveOwner: (id) => API.put(`/admin/users/${id}/approve`),
    rejectOwner: (id) => API.put(`/admin/users/${id}/reject`),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

// ── Upload ────────────────────────────────────────
export const uploadAPI = {
    image: (formData) => API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ── Wishlist ──────────────────────────────────────
export const wishlistAPI = {
    get: () => API.get("/wishlist"),
    toggle: (productId) => API.post(`/wishlist/toggle/${productId}`),
    remove: (productId) => API.delete(`/wishlist/remove/${productId}`),
    clear: () => API.delete("/wishlist/clear"),
    check: (productId) => API.get(`/wishlist/check/${productId}`),
};

// ── Addresses ─────────────────────────────────────
export const addressAPI = {
    get: () => API.get("/addresses"),
    add: (data) => API.post("/addresses", data),
    update: (id, data) => API.put(`/addresses/${id}`, data),
    delete: (id) => API.delete(`/addresses/${id}`),
    setDefault: (id) => API.put(`/addresses/${id}/default`),
};

// ── Coupons ───────────────────────────────────────
export const couponAPI = {
    getAll: () => API.get("/coupons"),
    create: (data) => API.post("/coupons", data),
    update: (id, data) => API.put(`/coupons/${id}`, data),
    delete: (id) => API.delete(`/coupons/${id}`),
    toggle: (id) => API.put(`/coupons/${id}/toggle`),
    validate: (data) => API.post("/coupons/validate", data),
};

// ── Announcements ─────────────────────────────────
export const announcementAPI = {
    getPublic: () => API.get("/announcements/public"),
    getAll: () => API.get("/announcements"),
    create: (data) => API.post("/announcements", data),
    update: (id, data) => API.put(`/announcements/${id}`, data),
    delete: (id) => API.delete(`/announcements/${id}`),
};

// ── Activity Logs ─────────────────────────────────
export const activityLogAPI = {
    getAll: (params) => API.get("/activity-logs", { params }),
    getByUser: (userId, params) => API.get(`/activity-logs/user/${userId}`, { params }),
};

// ── Categories ────────────────────────────────────
export const categoryAPI = {
    getPublic: () => API.get("/categories/public"),
    getAll: () => API.get("/categories"),
    create: (data) => API.post("/categories", data),
    update: (id, data) => API.put(`/categories/${id}`, data),
    delete: (id) => API.delete(`/categories/${id}`),
    toggle: (id) => API.put(`/categories/${id}/toggle`),
};

// ── Payouts ───────────────────────────────────────
export const payoutAPI = {
    getAll: (params) => API.get("/payouts", { params }),
    create: (data) => API.post("/payouts", data),
    updateStatus: (id, data) => API.put(`/payouts/${id}/status`, data),
    getMy: () => API.get("/payouts/my"),
    getEarnings: () => API.get("/payouts/earnings"),
};

// ── Chat ──────────────────────────────────────────
export const chatAPI = {
    startConversation: (data) => API.post("/chat/conversation", data),
    getConversations: () => API.get("/chat/conversations"),
    getUnreadCount: () => API.get("/chat/unread"),
    getMessages: (conversationId, params) => API.get(`/chat/${conversationId}/messages`, { params }),
    sendMessage: (conversationId, data) => API.post(`/chat/${conversationId}/messages`, data),
};

export default API;
