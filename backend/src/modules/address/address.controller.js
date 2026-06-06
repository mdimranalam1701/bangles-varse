import * as addressService from "./address.service.js";

export const getAddresses = async (req, res) => {
    try {
        const addresses = await addressService.getAddresses(req.user._id);
        res.json({ success: true, data: addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const addAddress = async (req, res) => {
    try {
        const addresses = await addressService.addAddress(req.user._id, req.body);
        res.status(201).json({ success: true, data: addresses, message: "Address added" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const addresses = await addressService.updateAddress(req.user._id, req.params.addressId, req.body);
        res.json({ success: true, data: addresses, message: "Address updated" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const addresses = await addressService.deleteAddress(req.user._id, req.params.addressId);
        res.json({ success: true, data: addresses, message: "Address deleted" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const setDefaultAddress = async (req, res) => {
    try {
        const addresses = await addressService.setDefault(req.user._id, req.params.addressId);
        res.json({ success: true, data: addresses, message: "Default address set" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
