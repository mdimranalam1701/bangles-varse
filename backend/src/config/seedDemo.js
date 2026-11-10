import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { User } from "../modules/auth/user.model.js";
import { Product } from "../modules/product/product.model.js";

dotenv.config();

const DEMO_PRODUCTS = [
    {
        name: "Jaipur Royal Kundan Bridal Chooda",
        nameHi: "जयपुरी रॉयल कुंदन दुल्हन चूड़ा",
        description:
            "Hand-set Polki Kundan work paired with pearl edging and deep sindoor lac bangles. Ideal for wedding ceremonies and auspicious occasions.",
        price: 2450,
        compareAtPrice: 3200,
        category: "Bridal",
        material: "Kundan & Pure Lac",
        occasion: "Bridal",
        sizes: ["2.2", "2.4", "2.6", "2.8"],
        setCount: 16,
        stock: 18,
        image: "/images/products/bridal-chooda.svg",
        isFeatured: true,
        averageRating: 4.9,
        numReviews: 24,
    },
    {
        name: "22K Gold Plated Rajwadi Kada Pair",
        nameHi: "22 कैरेट गोल्ड प्लेटेड राजवाड़ी कड़ा जोड़ी",
        description:
            "Heirloom temple-carved Kada bangles with screw-clasp opening for effortless wear and lasting luster.",
        price: 1650,
        compareAtPrice: 2100,
        category: "Gold",
        material: "22K Gold Plated Brass",
        occasion: "Festive",
        sizes: ["2.4", "2.6", "2.8", "2.10"],
        setCount: 2,
        stock: 25,
        image: "/images/products/gold-kada.svg",
        isFeatured: true,
        averageRating: 4.8,
        numReviews: 19,
    },
    {
        name: "Sindoor Crimson Meenakari Lac Set",
        nameHi: "सिंदूरी मीनाकारी लाख चूड़ी सेट",
        description:
            "Authentic Jaipur artisan-crafted lac bangles featuring delicate red-emerald enamel and gold leaf motifs.",
        price: 780,
        compareAtPrice: 1050,
        category: "Lac",
        material: "Handcrafted Jaipur Lac",
        occasion: "Festive",
        sizes: ["2.2", "2.4", "2.6", "2.8"],
        setCount: 8,
        stock: 40,
        image: "/images/products/meenakari-lac.svg",
        isFeatured: true,
        averageRating: 4.7,
        numReviews: 31,
    },
    {
        name: "Noor American Diamond Sleek Bangles",
        nameHi: "नूर अमेरिकन डायमंड स्लीक कंगन",
        description:
            "Fine rhodium-and-gold finished bangle stack studded with brilliant AAA cubic zirconia stones for evening wear.",
        price: 1990,
        compareAtPrice: 2600,
        category: "Diamond",
        material: "18K Gold Plated & AAA CZ",
        occasion: "Party",
        sizes: ["2.4", "2.6", "2.8"],
        setCount: 4,
        stock: 14,
        image: "/images/products/diamond-sleek.svg",
        isFeatured: true,
        averageRating: 4.9,
        numReviews: 16,
    },
    {
        name: "Rajasthani Oxidised Silver Peacock Kada",
        nameHi: "राजस्थानी चांदी ऑक्सीडाइज़्ड मोर कड़ा",
        description:
            "Artisan hammered silver-tone Kada engraved with traditional peacock motifs, comfortable for daily ethnic and fusion wear.",
        price: 690,
        compareAtPrice: 950,
        category: "Silver",
        material: "Antique Silver Alloy",
        occasion: "Daily Wear",
        sizes: ["2.4", "2.6", "2.8", "Free Size"],
        setCount: 2,
        stock: 32,
        image: "/images/products/silver-peacock.svg",
        isFeatured: false,
        averageRating: 4.6,
        numReviews: 22,
    },
    {
        name: "Suhag Rose Gold Everyday Minimal Set",
        nameHi: "सुहाग रोज़ गोल्ड डेली वियर सेट",
        description:
            "Lightweight anti-tarnish rose gold polished bangles crafted for all-day comfort at home and office.",
        price: 920,
        compareAtPrice: 1290,
        category: "Rose Gold",
        material: "Anti-Tarnish Rose Gold",
        occasion: "Daily Wear",
        sizes: ["2.2", "2.4", "2.6", "2.8"],
        setCount: 4,
        stock: 28,
        image: "/images/products/rose-gold.svg",
        isFeatured: false,
        averageRating: 4.7,
        numReviews: 14,
    },
    {
        name: "Firozabad Velvet & Gold Glass Choodiyan",
        nameHi: "फिरोजाबाद मखमली कांच की चूड़ियाँ",
        description:
            "Classic Firozabad glass bangles layered with soft maroon velvet finish and golden pearl borders — set of 24.",
        price: 450,
        compareAtPrice: 650,
        category: "Glass",
        material: "Firozabad Glass & Velvet",
        occasion: "Festive",
        sizes: ["2.2", "2.4", "2.6", "2.8"],
        setCount: 24,
        stock: 55,
        image: "/images/products/velvet-glass.svg",
        isFeatured: true,
        averageRating: 4.8,
        numReviews: 43,
    },
    {
        name: "Moti Mala Pearl & Gold Drop Kangans",
        nameHi: "मोती माला पर्ल गोल्ड कंगन जोड़ी",
        description:
            "Lustrous freshwater-style pearl clusters woven along delicate gold-toned bangle frames. Perfect gift for mothers and sisters.",
        price: 1290,
        compareAtPrice: 1650,
        category: "Gold",
        material: "Gold Plated & Faux Pearl",
        occasion: "Gift",
        sizes: ["2.4", "2.6", "2.8"],
        setCount: 2,
        stock: 19,
        image: "/images/products/pearl-kangan.svg",
        isFeatured: false,
        averageRating: 4.8,
        numReviews: 11,
    },
];

export const seedInitialCatalogIfEmpty = async () => {
    const productCount = await Product.countDocuments();
    if (productCount > 0) return;

    // Ensure admin exists
    const existingAdmin = await User.findOne({ email: "admin@bangelsverse.com" });
    if (!existingAdmin) {
        const adminHash = await bcrypt.hash("admin123", 12);
        await User.create({
            name: "Bangels Verse Admin",
            email: "admin@bangelsverse.com",
            phone: "9999900000",
            password: adminHash,
            role: "admin",
            isApproved: true,
        });
    }

    // Ensure approved flagship artisan shop owner exists
    let owner = await User.findOne({ email: "artisan@bangelsverse.com" });
    if (!owner) {
        const ownerHash = await bcrypt.hash("owner123", 12);
        owner = await User.create({
            name: "Rameshwar Johari",
            email: "artisan@bangelsverse.com",
            phone: "9876543210",
            whatsappNumber: "9876543210",
            password: ownerHash,
            role: "owner",
            companyName: "Johari Kundan & Lac Gharana",
            city: "Jaipur, Rajasthan",
            address: "Johari Bazaar, Lane 4, Jaipur",
            bio: "Three generations of authentic Jaipur Lac, Kundan, and Bridal Chooda craftsmanship.",
            isApproved: true,
        });
    }

    // Ensure sample customer exists
    const existingCustomer = await User.findOne({ phone: "9811122233" });
    if (!existingCustomer) {
        const custHash = await bcrypt.hash("1234", 12);
        await User.create({
            name: "Sunita Devi",
            email: "sunita@example.com",
            phone: "9811122233",
            whatsappNumber: "9811122233",
            password: custHash,
            role: "user",
            address: "Shastri Nagar, Near Shiv Mandir",
            city: "Lucknow",
            pincode: "226001",
        });
    }

    await Product.insertMany(
        DEMO_PRODUCTS.map((p) => ({
            ...p,
            images: [p.image],
            owner: owner._id,
        }))
    );

    console.log("Seeded flagship shop owner and 8 handcrafted bangle collections.");
};

const isDirectRun = process.argv[1] && pathResolveMatch(process.argv[1]);
function pathResolveMatch(scriptArg) {
    return fileURLToPath(import.meta.url).toLowerCase() === scriptArg.toLowerCase();
}

if (isDirectRun) {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bangelsverse";
    mongoose
        .connect(uri)
        .then(async () => {
            await seedInitialCatalogIfEmpty();
            await mongoose.disconnect();
            process.exit(0);
        })
        .catch((err) => {
            console.error("Seed error:", err);
            process.exit(1);
        });
}

