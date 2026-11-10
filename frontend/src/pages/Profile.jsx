import { useState, useEffect, useRef } from "react";
import { User, Phone, MapPin, Save, Camera, Store, Shield, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI, uploadAPI, resolveAssetUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { LoadingSpinner } from "../components/UI";

export default function Profile() {
    const { refreshUser } = useAuth();
    const { isHindi } = useLang();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        whatsappNumber: "",
        bio: "",
        companyName: "",
        address: "",
        city: "",
        pincode: "",
        profilePicture: "",
    });

    useEffect(() => {
        authAPI
            .getProfile()
            .then(({ data }) => {
                const p = data.data;
                setProfile(p);
                setForm({
                    name: p.name || "",
                    phone: p.phone || "",
                    whatsappNumber: p.whatsappNumber || "",
                    bio: p.bio || "",
                    companyName: p.companyName || "",
                    address: p.address || "",
                    city: p.city || "",
                    pincode: p.pincode || "",
                    profilePicture: p.profilePicture || "",
                });
            })
            .catch(() => toast.error("Failed to load profile"))
            .finally(() => setLoading(false));
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            const { data } = await uploadAPI.image(formData);
            if (data.success) {
                setForm((prev) => ({ ...prev, profilePicture: data.url }));
                toast.success("Photo uploaded! Click Save Changes.");
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
            localStorage.setItem("user", JSON.stringify(data.data));
            if (refreshUser) refreshUser();
            toast.success(isHindi ? "प्रोफ़ाइल सुरक्षित की गई" : "Profile updated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update");
        }
        setSaving(false);
    };

    if (loading) return <LoadingSpinner />;

    const isOwner = profile?.role === "owner";
    const isAdmin = profile?.role === "admin";

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-ink mb-6">
                {isHindi ? "मेरा प्रोफ़ाइल" : "My Profile"}
            </h1>

            <div className="card p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-sindoor-600 text-white text-3xl font-serif font-bold flex items-center justify-center overflow-hidden ring-4 ring-linen">
                        {form.profilePicture ? (
                            <img src={resolveAssetUrl(form.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            form.name?.[0]?.toUpperCase() || "U"
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        aria-label="Upload profile photo"
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center shadow hover:bg-sindoor-600 transition-colors"
                    >
                        {uploading ? <Camera size={14} className="animate-pulse" /> : <Edit2 size={14} />}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>

                <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-serif font-bold text-ink">{profile?.name}</h2>
                    <p className="text-sm text-umber">{profile?.phone || profile?.email}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                        <span className="badge bg-linen text-ink border border-parchment capitalize">
                            {isAdmin ? <Shield size={12} /> : <Store size={12} />} {profile?.role}
                        </span>
                        {isOwner && (
                            <span
                                className={`badge ${
                                    profile?.isApproved
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-brass-50 text-brass-700 border border-brass-200"
                                }`}
                            >
                                {profile?.isApproved ? "Approved Shop" : "Pending Admin Approval"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-ink mb-1">Full Name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" />
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="input-field !pl-10"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-ink mb-1">Mobile Number</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" />
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="input-field !pl-10"
                            />
                        </div>
                    </div>

                    {isOwner && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-ink mb-1">Shop / Company Name</label>
                                <input
                                    type="text"
                                    value={form.companyName}
                                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-ink mb-1">WhatsApp Order Number</label>
                                <input
                                    type="tel"
                                    value={form.whatsappNumber}
                                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                                    placeholder="10-digit WhatsApp number"
                                    className="input-field"
                                />
                            </div>
                        </>
                    )}

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-ink mb-1">Address</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3.5 top-3.5 text-umber/60" />
                            <textarea
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="input-field !pl-10 min-h-[76px] resize-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-ink mb-1">City</label>
                        <input
                            type="text"
                            value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-ink mb-1">Pincode</label>
                        <input
                            type="text"
                            value={form.pincode}
                            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-ink mb-1">Bio / Shop Story</label>
                        <textarea
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            className="input-field min-h-[84px] resize-none"
                        />
                    </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary">
                    <Save size={16} />
                    {saving ? "Saving..." : isHindi ? "बदलाव सुरक्षित करें" : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
