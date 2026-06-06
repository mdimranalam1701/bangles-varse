import { Review } from "./review.model.js";
import { Product } from "../product/product.model.js";

// add review
export const addReview = async (
  userId,
  productId,
  rating,
  comment
) => {

  // prevent duplicate review
  const existingReview = await Review.findOne({
    user: userId,
    product: productId,
  });

  if (existingReview) {
    throw new Error(
      "You already reviewed this product"
    );
  }

  // create review
  await Review.create({
    user: userId,
    product: productId,
    rating,
    comment,
  });

  // get all product reviews
  const reviews = await Review.find({
    product: productId,
  });

  // calculate average
  const totalRating = reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  const averageRating =
    totalRating / reviews.length;

  // update product
  await Product.findByIdAndUpdate(productId, {
    averageRating,
    numReviews: reviews.length,
  });

  return {
    message: "Review added successfully",
  };
};

// get reviews
export const getProductReviews = async (
  productId
) => {

  return await Review.find({
    product: productId,
  })
    .populate("user", "name")
    .sort({ createdAt: -1 });

};