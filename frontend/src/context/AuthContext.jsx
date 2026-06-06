import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await authAPI.login({ email, password });
            const { user: u, token } = data.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(u));
            setUser(u);
            toast.success(`Welcome back, ${u.name}!`);
            if (u.role === "owner") navigate("/owner/dashboard");
            else if (u.role === "admin") navigate("/admin/dashboard");
            else navigate("/");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
            return false;
        }
    };

    const register = async (name, email, password, role) => {
        try {
            await authAPI.register({ name, email, password, role });
            toast.success("Account created! Please login.");
            navigate("/login");
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
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
