import { User } from "../auth/user.model.js";

export const getAddresses = async (userId) => {
    const user = await User.findById(userId).select("addresses");
    return user?.addresses || [];
};

export const addAddress = async (userId, addressData) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // If first address or marked as default, make it default
    if (!user.addresses || user.addresses.length === 0) {
        addressData.isDefault = true;
    }

    if (addressData.isDefault) {
        // Unset other defaults
        user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    if (!user.addresses) user.addresses = [];
    user.addresses.push(addressData);
    await user.save();
    return user.addresses;
};

export const updateAddress = async (userId, addressId, addressData) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const address = user.addresses.id(addressId);
    if (!address) throw new Error("Address not found");

    if (addressData.isDefault) {
        user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, addressData);
    await user.save();
    return user.addresses;
};

export const deleteAddress = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const address = user.addresses.id(addressId);
    if (!address) throw new Error("Address not found");

    const wasDefault = address.isDefault;
    address.deleteOne();

    // If deleted was default, make first remaining address default
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();
    return user.addresses;
};

export const setDefault = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.addresses.forEach((addr) => {
        addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();
    return user.addresses;
};
