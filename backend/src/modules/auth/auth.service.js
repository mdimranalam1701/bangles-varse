import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./user.model.js";

export const registerUser = async (data) => {
    const { name, email, password, role } = data;


    //check existing
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User aleardy exists");
    }

    // block admin registration
    if (role == "admin") {
        throw new Error("you cannot register as admin");
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role === "owner" ? "owner" : "user",
    });

    return user;
};


export const loginUser = async (data) => {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    // const isrole = await compare(role,user.role);
    // if(!isrole) {
    //     throw new Error(" invalid role ");
    // }

    //generate token
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }

    );

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
        }, token
    };
};

export const getProfile = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User not found");
    return user;
};

export const updateProfile = async (userId, data) => {
    const allowedFields = ["name", "phone", "bio", "companyName", "address", "profilePicture"];
    const updateData = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
    ).select("-password");

    if (!user) throw new Error("User not found");
    return user;
};