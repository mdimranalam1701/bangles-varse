import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import OwnerDashboard from "./pages/OwnerDashboard";
import MyShop from "./pages/MyShop";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import CreditHistory from "./pages/CreditHistory";
import OrderDetail from "./pages/OrderDetail";
import Wishlist from "./pages/Wishlist";
import Notifications from "./pages/Notifications";
import AddressBook from "./pages/AddressBook";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>
                    <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-1">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/products/:id" element={<ProductDetail />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                                <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="/credit-history" element={<ProtectedRoute><CreditHistory /></ProtectedRoute>} />
                                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                                <Route path="/addresses" element={<ProtectedRoute><AddressBook /></ProtectedRoute>} />
                                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                                <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                                <Route path="/my-shop" element={<ProtectedRoute roles={["owner"]}><MyShop /></ProtectedRoute>} />
                                <Route path="/owner/dashboard" element={<ProtectedRoute roles={["owner"]}><OwnerDashboard /></ProtectedRoute>} />
                                <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: "#1a1a1a",
                                color: "#fff",
                                borderRadius: "12px",
                            },
                        }}
                    />
                    </WishlistProvider>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
