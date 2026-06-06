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
};

// ── Products ──────────────────────────────────────
export const productAPI = {
    getAll: (params) => API.get("/products", { params }),
    create: (data) => API.post("/products", data),
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
    getAll: () => API.get("/orders"),
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
    add: (data) => API.post("/credit/add", data),
    pay: (ownerId, data) => API.post(`/credit/pay/${ownerId}`, data),
    get: (ownerId) => API.get(`/credit/${ownerId}`),
};

// ── Notifications ─────────────────────────────────
export const notificationAPI = {
    get: () => API.get("/notifications"),
};

// ── Transactions ──────────────────────────────────
export const transactionAPI = {
    getMy: () => API.get("/transaction/my"),
    getAll: () => API.get("/transaction"),
};

// ── Dashboard ─────────────────────────────────────
export const dashboardAPI = {
    getOwner: () => API.get("/dashboard/owner"),
};

export default API;
