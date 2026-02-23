const Products = require("../products/product.model");
const { errorResponse, successResponse } = require("../utilis/responseHandler");
const Reviews = require("./review.model");

const postAReview = async (req, res) => {
    try {
        const { comment, rating, userId, productId } = req.body;

        if (!comment || rating === undefined || !productId || !userId) {
            return errorResponse(res, 400, "Missing Required Fields");
        }

        // 1. Save or Update the Review
        let review = await Reviews.findOne({ productId, userId });

        if (review) {
            review.comment = comment;
            review.rating = rating;
            await review.save();
        } else {
            review = new Reviews({ comment, rating, userId, productId });
            await review.save();
        }

        // 2. Recalculate Average Rating (Always run this after save)
        const reviews = await Reviews.find({ productId });
        
        // This should always be > 0 because we just saved/updated one
        const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
        const averageRating = totalRating / reviews.length;

        // 3. Update the Product
        const product = await Products.findById(productId);
        if (!product) {
            return errorResponse(res, 404, "Product not found");
        }

        product.rating = averageRating;
        // validateBeforeSave: false is useful if you have required fields like 'image' 
        // that aren't present in this specific update
        await product.save({ validateBeforeSave: false });

        return successResponse(res, 201, "Review processed successfully!", {
            review,
            averageRating: averageRating.toFixed(1)
        });

    } catch (error) {
        console.error("Review Error:", error);
        return errorResponse(res, 500, "Failed to Post a Review", error.message);
    }
};

const getuserReview = async (req, res) => {
    const {userId} = req.params;

    try {
        if (!userId) {
            return errorResponse(res, 400, "Missing User ID")
        }
        const reviews = await Reviews.find({userId: userId}).sort({createdAt: -1})
        if (reviews.length === 0) {
            return errorResponse(res, 404, "No Reviews found for this user")
        }

        return successResponse(res, 200, "Reviews Fetched successfully", reviews)

    } catch (error) {
       return errorResponse(res, 500, "Failed to get users Review", error)
    }

}

const getTotalReviewsCount = async(req, res) => {
    try {
        const totalReviews = await Reviews.countDocuments({});
        return successResponse(res, 200, "Total Reviews Fetched Successfully", totalReviews)
    } catch (error) {
       return errorResponse(res, 404, "Failed to get users reviews", error)
    }
}

module.exports = { postAReview, getuserReview, getTotalReviewsCount };