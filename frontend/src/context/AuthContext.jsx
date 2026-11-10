import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { authAPI, API_ORIGIN } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("user");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const socketRef = useRef(null);

    const fetchProfile = useCallback(async () => {
        try {
            const { data } = await authAPI.getProfile();
            const fullUser = data.data;
            localStorage.setItem("user", JSON.stringify(fullUser));
            setUser(fullUser);
            return fullUser;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchProfile().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [fetchProfile]);

    // Real-time Socket.IO connection for live shop/customer alerts
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!user || !token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        const socket = io(API_ORIGIN || window.location.origin, {
            auth: { token },
            transports: ["websocket", "polling"],
        });

        socket.on("newOrder", (payload) => {
            toast.success(
                `New Order ${payload?.orderCode || ""} — Rs.${Number(payload?.amount || 0).toLocaleString("en-IN")}`,
                { duration: 5000 }
            );
        });

        socket.on("orderUpdated", (payload) => {
            toast.success(
                `Order ${payload?.orderCode || ""} is now ${payload?.status || "updated"}`,
                { duration: 4500 }
            );
        });

        socket.on("accountApproved", () => {
            toast.success("Your shop account has been approved!");
            fetchProfile();
        });

        socketRef.current = socket;
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user?._id, fetchProfile]);

    const login = async (identifier, password) => {
        try {
            const { data } = await authAPI.login({ identifier, password });
            const { user: u, token } = data.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(u));
            setUser(u);
            fetchProfile();
            toast.success(`Welcome back, ${u.name}!`);
            if (u.role === "owner") navigate("/owner/dashboard");
            else if (u.role === "admin") navigate("/admin/dashboard");
            else navigate("/");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid mobile/email or password");
            return false;
        }
    };

    const register = async (payload) => {
        try {
            const { data } = await authAPI.register(payload);
            const u = data.user || data.data;
            const token = data.token;
            if (token && u) {
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(u));
                setUser(u);
                toast.success(`Welcome to Bangels Verse, ${u.name}!`);
                if (u.role === "owner") navigate("/owner/dashboard");
                else navigate("/");
            } else {
                toast.success("Account created! Please sign in.");
                navigate("/login");
            }
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        toast.success("Signed out");
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
