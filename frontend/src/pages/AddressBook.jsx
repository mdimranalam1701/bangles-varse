import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import { addressAPI } from "../services/api";
import { LoadingSpinner, EmptyState } from "../components/UI";

export default function AddressBook() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        label: "Home", fullName: "", phone: "", street: "", city: "", state: "", pincode: "", country: "India", isDefault: false,
    });

    useEffect(() => { fetchAddresses(); }, []);

    const fetchAddresses = async () => {
        try {
            const { data } = await addressAPI.get();
            setAddresses(data.data || []);
        } catch { setAddresses([]); }
        setLoading(false);
    };

    const resetForm = () => {
        setForm({ label: "Home", fullName: "", phone: "", street: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
        setEditingId(null);
        setShowForm(false);
    };

    const startEdit = (addr) => {
        setForm({
            label: addr.label || "Home",
            fullName: addr.fullName || "",
            phone: addr.phone || "",
            street: addr.street || "",
            city: addr.city || "",
            state: addr.state || "",
            pincode: addr.pincode || "",
            country: addr.country || "India",
            isDefault: addr.isDefault || false,
        });
        setEditingId(addr._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await addressAPI.update(editingId, form);
                toast.success("Address updated");
            } else {
                await addressAPI.add(form);
                toast.success("Address added");
            }
            resetForm();
            fetchAddresses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save address");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this address?")) return;
        try {
            await addressAPI.delete(id);
            toast.success("Address deleted");
            fetchAddresses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete");
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await addressAPI.setDefault(id);
            toast.success("Default address set");
            fetchAddresses();
        } catch (err) {
            toast.error("Failed to set default");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Address Book</h1>
                    <p className="text-gray-400 mt-1">Manage your shipping addresses</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2 !py-2.5 !px-4 text-sm">
                    <FiPlus size={16} /> Add Address
                </button>
            </div>

            {/* Address Form */}
            {showForm && (
                <div className="card p-6 mb-8 animate-fade-in !shadow-lg border border-gold-100/30">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-serif font-semibold text-lg">{editingId ? "Edit Address" : "New Address"}</h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Label</label>
                            <div className="flex gap-2">
                                {["Home", "Office", "Other"].map((l) => (
                                    <button key={l} type="button" onClick={() => setForm({ ...form, label: l })}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${form.label === l ? "bg-gold-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gold-50"}`}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" required />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address *</label>
                            <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                            <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                            <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-field" required />
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                            <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="w-4 h-4 accent-gold-500" />
                            <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
                        </div>
                        <div className="sm:col-span-2 flex gap-3 mt-2">
                            <button type="submit" className="btn-primary">{editingId ? "Update Address" : "Save Address"}</button>
                            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Address List */}
            {addresses.length === 0 && !showForm ? (
                <EmptyState icon="📍" title="No addresses saved" description="Add a shipping address for faster checkout."
                    action={<button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><FiPlus /> Add Address</button>} />
            ) : (
                <div className="space-y-4 stagger-children">
                    {addresses.map((addr) => (
                        <div key={addr._id} className={`card p-5 flex items-start gap-4 ${addr.isDefault ? "!border-gold-300 bg-gold-50/30" : ""}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${addr.isDefault ? "bg-gold-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                                <FiMapPin size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-800">{addr.label}</span>
                                    {addr.isDefault && <span className="badge bg-gold-100 text-gold-700 text-[10px]">Default</span>}
                                </div>
                                <p className="text-sm text-gray-600">{addr.fullName}</p>
                                <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                <p className="text-sm text-gray-400">{addr.phone}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                {!addr.isDefault && (
                                    <button onClick={() => handleSetDefault(addr._id)} className="p-2 text-gray-400 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors" title="Set as default">
                                        <FiCheck size={16} />
                                    </button>
                                )}
                                <button onClick={() => startEdit(addr)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                    <FiEdit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(addr._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
