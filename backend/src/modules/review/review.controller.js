import * as reviewService from "./review.service.js";

// add review
export const addReview = async (req, res) => {
  try {

    const { rating, comment } = req.body;

    const result =
      await reviewService.addReview(
        req.user._id,
        req.params.productId,
        rating,
        comment
      );

    res.json({
      success: true,
      data: result,
    });

  } catch (err) {

    res.status(400).json({
      success: false,
      message: err.message,
    });

  }
};

// get reviews
export const getReviews = async (req, res) => {
  try {

    const reviews =
      await reviewService.getProductReviews(
        req.params.productId
      );

    res.json({
      success: true,
      data: reviews,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};