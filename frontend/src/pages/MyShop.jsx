import { useAuth } from "../context/AuthContext";
import Products from "./Products";

// Reuses the Products page but filters to show only the owner's products
export default function MyShop() {
    const { user } = useAuth();

    if (!user || user.role !== "owner") {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <p className="text-gray-400 text-lg">This page is only for shop owners.</p>
            </div>
        );
    }

    // Pass the owner's ID as a URL search param to filter products
    return <Products ownerFilter={user.id || user._id} />;
}
