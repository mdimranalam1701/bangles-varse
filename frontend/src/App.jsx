import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { LangProvider } from "./context/LangContext";
import { WishlistProvider } from "./context/WishlistContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import QuickOrderModal from "./components/QuickOrderModal";
import SizeGuideModal from "./components/SizeGuideModal";
import ProtectedRoute from "./components/ProtectedRoute";
import { LoadingSpinner } from "./components/UI";

const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const AddressBook = lazy(() => import("./pages/AddressBook"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Chat = lazy(() => import("./pages/Chat"));
const CreditHistory = lazy(() => import("./pages/CreditHistory"));
const TransactionHistory = lazy(() => import("./pages/TransactionHistory"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const MyShop = lazy(() => import("./pages/MyShop"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Profile = lazy(() => import("./pages/Profile"));

export default function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <LangProvider>
                    <AuthProvider>
                        <CartProvider>
                            <WishlistProvider>
                            <div className="min-h-screen flex flex-col bg-ivory text-ink">
                                <Navbar />
                                <main className="flex-1">
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <Routes>
                                            <Route path="/" element={<Home />} />
                                            <Route path="/products" element={<Products />} />
                                            <Route path="/products/:id" element={<ProductDetail />} />
                                            <Route path="/track-order" element={<TrackOrder />} />
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/register" element={<Register />} />
                                            <Route
                                                path="/cart"
                                                element={
                                                    <ProtectedRoute>
                                                        <Cart />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/checkout"
                                                element={
                                                    <ProtectedRoute>
                                                        <Checkout />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/my-orders"
                                                element={
                                                    <ProtectedRoute>
                                                        <MyOrders />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/orders/:id"
                                                element={
                                                    <ProtectedRoute>
                                                        <OrderDetail />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/wishlist"
                                                element={
                                                    <ProtectedRoute>
                                                        <Wishlist />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/addresses"
                                                element={
                                                    <ProtectedRoute>
                                                        <AddressBook />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/notifications"
                                                element={
                                                    <ProtectedRoute>
                                                        <Notifications />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/chat"
                                                element={
                                                    <ProtectedRoute>
                                                        <Chat />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/chat/:conversationId"
                                                element={
                                                    <ProtectedRoute>
                                                        <Chat />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/credit-history"
                                                element={
                                                    <ProtectedRoute>
                                                        <CreditHistory />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/transactions"
                                                element={
                                                    <ProtectedRoute>
                                                        <TransactionHistory />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/profile"
                                                element={
                                                    <ProtectedRoute>
                                                        <Profile />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/my-shop"
                                                element={
                                                    <ProtectedRoute roles={["owner"]}>
                                                        <MyShop />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/owner/dashboard"
                                                element={
                                                    <ProtectedRoute roles={["owner"]}>
                                                        <OwnerDashboard />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/admin/dashboard"
                                                element={
                                                    <ProtectedRoute roles={["admin"]}>
                                                        <AdminDashboard />
                                                    </ProtectedRoute>
                                                }
                                            />
                                        </Routes>
                                    </Suspense>
                                </main>
                                <Footer />
                            </div>
                            <QuickOrderModal />
                            <SizeGuideModal />
                            <Toaster
                                position="top-center"
                                toastOptions={{
                                    duration: 3200,
                                    style: {
                                        background: "#1C1613",
                                        color: "#FAF7F2",
                                        borderRadius: "10px",
                                        fontSize: "14px",
                                    },
                                }}
                            />
                            </WishlistProvider>
                        </CartProvider>
                    </AuthProvider>
                </LangProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
