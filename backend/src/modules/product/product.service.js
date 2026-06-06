import { Product } from "./product.model.js";

export const createProduct = async (DataTransfer, userId) =>{
    const product = await Product.create({
        ...data,
        owner:userId,
    });


    return product;
};

export const getAllProducts = async (query) =>{
    
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const filter = {};

    //search by name
    if (query.search) {
        filter.name = {
            $regex : query.search,
            $options: "i",
        };
    }

    //filter by category
    if(query.category) {
        filter.category = query.category;
    }

    const products = await Product.find(filter)
    .populate("owner","name")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1});


    const totalProducts = await product.countDocuments(filter);

    return{
        products,
        currentPage: page,
        totalPages : Math.ceil(totalProducts / limit),
        totalProducts,
    };
};

export const deleteProducts = async (productId, userId) =>{
    const product = await Product.findById(productId);

    if(!product) throw new Error("product not found");

    //only owner can delete

    if (product.owner.toString() !== userId.toString()){
        throw new Error("Not authorized");
    }

    await product.deleteOne();

    return { message: "Product deleted"};
};