const express = require('express');
const { createNewProduct, getAllProducts, getSingleProduct, updateProductByid, deleteProductById } = require('./product.controller');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

const router = express.Router();

// create a product only admin
router.post("/create-product", verifyToken, verifyAdmin, createNewProduct)

//get all products
router.get('/', getAllProducts);

//get single product
router.get('/:id', getSingleProduct);

// update product by admin
router.patch("/update-product/:id", verifyToken, verifyAdmin, updateProductByid);

// delete product by admin
router.delete("/:id", verifyToken,verifyAdmin, deleteProductById);

module.exports = router;