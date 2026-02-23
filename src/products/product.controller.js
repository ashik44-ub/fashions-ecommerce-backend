const Reviews = require("../reviews/review.model");
const { errorResponse, successResponse } = require("../utilis/responseHandler")
const Products = require("./product.model")


const createNewProduct = async (req, res)=> {
    try {
        const newProduct = new Products({
            ...req.body
        })
        const saveProduct = await newProduct.save();
        // calculation average rating
        const reviews = await Reviews.find({productId: saveProduct._id})
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review)=>  acc + review.rating , 0);
            const averageRating = totalRating / reviews.length
            saveProduct.rating = averageRating;
            await saveProduct.save();
        }

        return successResponse(res, 200, "Product Create Successfully!", saveProduct)
    } catch (error) {
        return errorResponse(res, 500, "Failed to create new product", error)
    }
}


const getAllProducts = async (req, res) => {
    try {
        const { category, color, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
        const filter = {};

        // Category Filter
        if (category && category !== 'all') {
            filter.category = category;
        }

        // Color Filter
        if (color && color !== 'all') {
            filter.color = color;
        }

        // Price Filter (MODIFIED LOGIC)
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            
            // 0 keo value hisebe dhorbe, faka string ba undefined hole skip korbe
            if (minPrice !== "" && minPrice !== undefined) {
                filter.price.$gte = parseFloat(minPrice);
            }
            
            if (maxPrice !== "" && maxPrice !== undefined) {
                filter.price.$lte = parseFloat(maxPrice);
            }

            // Jodi filter.price empty object {} thake, tobe filter theke remove korbe
            if (Object.keys(filter.price).length === 0) {
                delete filter.price;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const totalProducts = await Products.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / parseInt(limit));

        const products = await Products.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'email username');

        // successResponse-e 'data=' lekhar dorkar nai, shudhu object-ti pathao
        return successResponse(res, 200, "Products fetched successfully", {
            products,
            totalProducts,
            totalPages
        });
    } catch (error) {
        console.error("Backend Error Log:", error); // Terminal e dekho ki error
        return errorResponse(res, 500, "failed to get all products", error.message);
    }
}

// signle product show
const getSingleProduct = async(req, res) => {
    const {id} = req.params;
    try {
        const product = await Products.findById(id).populate('author', 'email username');

        if (!product) {
            return errorResponse(res, 404, "Product not found")
        }
        // product id pabo hocche review model er moddhe
        const reviews = await Reviews.find({productId: id}).populate('userId', 'username email')

        return successResponse(res, 200, "Signle Product and Reviews", {product, reviews})

    } catch (error) {
        return errorResponse(res, 500, "Failed to get Signle product", error)
    }
}

//update product
const updateProductByid = async(req, res) => {
    const productId = req.params.id;
    try {
        const updatedProduct = await Products.findByIdAndUpdate(productId, {...req.body}, {
            new: true
        })

        if (!updatedProduct) {
            return errorResponse(res, 404, "Product not Found")
        }

        return successResponse(res, 200, "Product Updated Succesfull!", updatedProduct)


    } catch (error) {
        errorResponse(res, 500, "Failed to update", error)
    }
}

// delete product by admin
const deleteProductById = async(req, res) => {
    // id ta aivabe neyar karon hocche amra product delete korbo r product delete review & comment keno rakhbo tai aivabe neya hoi id ta
    const productId = req.params.id;
    try {
        const deleteProduct = await Products.findByIdAndDelete(productId);
        if (!deleteProduct) {
            return errorResponse(res, 404, "Product not deleted")
        }
        await Reviews.deleteMany({ productId: productId });
        return successResponse(res, 200, "Product Deleted Successfully!")
    } catch (error) {
        return errorResponse(res, 500, "Failed to Delete Product", error)
    }
}


module.exports = {
    createNewProduct,
    getAllProducts,
    getSingleProduct,
    updateProductByid,
    deleteProductById
}