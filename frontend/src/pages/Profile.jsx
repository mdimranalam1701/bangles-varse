import { useState, useEffect, useRef } from "react";
import { FiUser, FiPhone, FiMapPin, FiSave, FiCamera, FiBriefcase, FiEdit2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { authAPI, uploadAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/UI";

export default function Profile() {
    const { user: authUser, refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        bio: "",
        companyName: "",
        address: "",
        profilePicture: "",
        upiId: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await authAPI.getProfile();
            const p = data.data;
            setProfile(p);
            setForm({
                name: p.name || "",
                phone: p.phone || "",
                bio: p.bio || "",
                companyName: p.companyName || "",
                address: p.address || "",
                profilePicture: p.profilePicture || "",
                upiId: p.upiId || "",
            });
        } catch (err) {
            toast.error("Failed to load profile");
        }
        setLoading(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be less than 2MB");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            const { data } = await uploadAPI.image(formData);
            if (data.success) {
                setForm({ ...form, profilePicture: data.url });
                toast.success("Photo uploaded! Click Save to update.");
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
        }
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await authAPI.updateProfile(form);
            setProfile(data.data);
            setForm({
                name: data.data.name || "",
                phone: data.data.phone || "",
                bio: data.data.bio || "",
                companyName: data.data.companyName || "",
                address: data.data.address || "",
                profilePicture: data.data.profilePicture || "",
                upiId: data.data.upiId || "",
            });
            // Update localStorage with full profile including profilePicture
            localStorage.setItem("user", JSON.stringify(data.data));
            // Refresh auth context so Navbar shows new profile picture
            if (refreshUser) refreshUser();
            toast.success("Profile updated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update");
        }
        setSaving(false);
    };

    if (loading) return <LoadingSpinner />;

    const isOwner = profile?.role === "owner";
    const isAdmin = profile?.role === "admin";
    const roleLabel = isAdmin ? "👑 Admin" : isOwner ? "🏪 Shop Owner" : "🛍️ Customer";
    const roleColor = isAdmin ? "bg-red-100 text-red-700" : isOwner ? "bg-purple-100 text-purple-700" : "bg-gold-100 text-gold-700";

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Profile</h1>

            {/* Profile Header Card */}
            <div className="card p-8 mb-6 !shadow-xl !shadow-gold-100/20 border border-gold-100/30 bg-gradient-to-br from-white to-gold-50/30">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Profile Picture with Edit Overlay */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-5xl font-bold overflow-hidden ring-4 ring-gold-200/60 shadow-xl shadow-gold-200/40 group-hover:ring-gold-400 transition-all duration-300">
                            {form.profilePicture ? (
                                <img src={form.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                form.name?.[0]?.toUpperCase() || "U"
                            )}
                        </div>

                        {/* Edit Icon Overlay */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                        >
                            {uploading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <div className="flex flex-col items-center gap-0.5">
                                    <FiCamera size={24} className="text-white" />
                                    <span className="text-[10px] text-white font-semibold">Edit</span>
                                </div>
                            )}
                        </button>

                        {/* Small Edit Badge */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border-2 border-white"
                        >
                            <FiEdit2 size={14} className="text-white" />
                        </button>

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </div>

                    {/* User Info */}
                    <div className="text-center sm:text-left flex-1">
                        <h2 className="text-2xl font-serif font-bold text-gray-800">{profile?.name}</h2>
                        <p className="text-gray-400 mt-1">{profile?.email}</p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                            <span className={`badge ${roleColor} shadow-sm`}>{roleLabel}</span>
                            {isOwner && (
                                <span className={`badge ${profile?.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"} shadow-sm`}>
                                    {profile?.isApproved ? "✓ Approved" : "⏳ Pending"}
                                </span>
                            )}
                        </div>
                        {isOwner && profile?.companyName && (
                            <p className="text-sm text-gold-600 font-semibold mt-2">🏢 {profile.companyName}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="card p-8 !shadow-lg !shadow-gold-100/10 border border-gold-100/20">
                <h3 className="font-serif font-semibold text-xl text-gray-800 mb-8 flex items-center gap-2">
                    <FiEdit2 size={18} className="text-gold-500" />
                    Edit Profile
                </h3>

                <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                        <div className="relative">
                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="input-field !pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                        <div className="relative">
                            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                                className="input-field !pl-10"
                            />
                        </div>
                    </div>

                    {isOwner && (
                        <>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company / Shop Name</label>
                                <div className="relative">
                                    <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        value={form.companyName}
                                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                        placeholder="Your shop name"
                                        className="input-field !pl-10"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID (For accepting payments)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">UPI</span>
                                    <input
                                        type="text"
                                        value={form.upiId}
                                        onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                                        placeholder="yourname@upi"
                                        className="input-field !pl-12"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                        <div className="relative">
                            <FiMapPin className="absolute left-4 top-4 text-gray-400" size={16} />
                            <textarea
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Your address"
                                className="input-field !pl-10 min-h-[80px] resize-none"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                        <textarea
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            className="input-field min-h-[100px] resize-none"
                        />
                    </div>

                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary mt-6 flex items-center gap-2"
                >
                    <FiSave size={16} />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
