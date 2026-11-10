import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin, Check } from "lucide-react";
import toast from "react-hot-toast";
import { addressAPI } from "../services/api";
import { LoadingSpinner, EmptyState } from "../components/UI";

const emptyAddr = { label: "Home", fullName: "", phone: "", street: "", city: "", state: "", pincode: "", isDefault: false };

export default function AddressBook() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyAddr);

    const fetchAddresses = async () => {
        try {
            const { data } = await addressAPI.get();
            setAddresses(data.data || []);
        } catch {
            setAddresses([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const resetForm = () => {
        setForm(emptyAddr);
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await addressAPI.update(editingId, form);
                toast.success("Address updated");
            } else {
                await addressAPI.add(form);
                toast.success("Address saved");
            }
            resetForm();
            fetchAddresses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save address");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-ink">Saved Addresses</h1>
                    <p className="text-sm text-umber">Manage your home and shop delivery addresses</p>
                </div>
                <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">
                    <Plus size={16} /> Add Address
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card p-6 mb-6 grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 flex gap-2">
                        {["Home", "Shop", "Other"].map((lbl) => (
                            <button
                                key={lbl}
                                type="button"
                                onClick={() => setForm({ ...form, label: lbl })}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
                                    form.label === lbl ? "bg-sindoor-600 text-white border-sindoor-600" : "bg-white text-ink border-parchment"
                                }`}
                            >
                                {lbl}
                            </button>
                        ))}
                    </div>
                    <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full Name *" className="input-field" required />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-Digit Phone *" className="input-field" required />
                    <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="House / Street / Village *" className="input-field sm:col-span-2" required />
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City *" className="input-field" required />
                    <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State *" className="input-field" required />
                    <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="Pincode *" className="input-field" required />
                    <label className="flex items-center gap-2 text-sm text-ink">
                        <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="w-4 h-4 accent-sindoor-600" />
                        Set as default address
                    </label>
                    <div className="sm:col-span-2 flex gap-3">
                        <button type="submit" className="btn-primary text-sm">Save Address</button>
                        <button type="button" onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
                    </div>
                </form>
            )}

            {addresses.length === 0 ? (
                <EmptyState icon={MapPin} title="No saved addresses" description="Add your delivery address for faster checkout." />
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((a) => (
                        <div key={a._id} className={`card p-5 space-y-2 ${a.isDefault ? "border-sindoor-600" : ""}`}>
                            <div className="flex items-center justify-between">
                                <span className="badge bg-linen text-ink">{a.label}</span>
                                <div className="flex gap-2">
                                    {!a.isDefault && (
                                        <button
                                            type="button"
                                            onClick={async () => { await addressAPI.setDefault(a._id); fetchAddresses(); }}
                                            className="text-umber hover:text-emerald-700"
                                            title="Make default"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => { setForm(a); setEditingId(a._id); setShowForm(true); }}
                                        className="text-umber hover:text-sindoor-700"
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => { await addressAPI.delete(a._id); fetchAddresses(); }}
                                        className="text-umber hover:text-red-600"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                            <p className="font-semibold text-ink">{a.fullName}</p>
                            <p className="text-sm text-umber">{a.street}, {a.city}, {a.state} - {a.pincode}</p>
                            <p className="text-xs text-umber">Phone: {a.phone}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
