import * as productService from "./product.service.js";

export const createProduct = async (req, res) => {
  try {

    const productData = {
      ...req.body,
      image: req.file?.path,
    };

    const product = await productService.createProduct(
      req.body,
      req.user._id
    );

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(rew.query);

    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(
      req.params.id,
      req.user._id
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};