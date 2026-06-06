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

export default API;
