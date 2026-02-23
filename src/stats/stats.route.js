const express = require('express');
const { errorResponse, successResponse } = require('../utilis/responseHandler');
const User = require('../users/user.model');
const Order = require('../orders/order.model');
const Reviews = require('../reviews/review.model');
const Products = require('../products/product.model');
const router = express.Router();


// user stats
router.get('/user-stats/:email', async(req, res)=> {
    const {email} = req.params;
    if(!email){
        return errorResponse(res, 400, "Email is Required")
    }
    try {
        const user = await User.findOne({email: email});
        if (!user) {
            return errorResponse(res, 404, "user not found")
        }
        // total payments
        const totalPaymentsResult = await Order.aggregate([
            {$match: {email: email}},
            {$group: {_id: null, totalAmount: {$sum: "$amount"} }}
        ])

        const totalPaymentAmount = totalPaymentsResult.length > 0 ? totalPaymentsResult[0].totalAmount : 0;

        // total Reviews
        const totalReviews = await Reviews.countDocuments({userId: user._id});

        // total products purchase
        const purchasedProducts = await Order.distinct("products.productId", {email: email});
        
        const totalPurchaseProducts = purchasedProducts.length;

        return successResponse(res, 200, "Fetched user stats successfully", {
            totalPayments: Number(totalPaymentAmount.toFixed(2)),
            totalReviews,
            totalPurchaseProducts
        })
        

    } catch (error) {
       return errorResponse(res, 500, "couldn't get user stats")
    }
})

// admin stats
router.get("/admin-stats", async(req, res)=> {
    try {
        // count total orders
    const totalOrders = await Order.countDocuments();

    // count total products 
    const totalPrdoucts = await Products.countDocuments();

    // count total reviews
    const totalReviews = await Reviews.countDocuments();

    // count total users
    const totalUsers = await User.countDocuments();

    // calculate total earnings by summing the amount of all orders
    const totalEaringsResult = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalEarnings: {$sum: "$amount"},
            }
        }
    ]);

    const totalEarnings = totalEaringsResult.length > 0 ? totalEaringsResult[0].totalEarnings : 0;

    // calculate monthly earings by summing the amount of all orders grouped by month
    const monthlyEarningsResult = await Order.aggregate([
        {
            $group: {
                _id: { month: { $month: "$createdAt"}, year: { $year: "$createdAt"}},
                monthlyEarnings: {$sum : "$sum"},
            },
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1} // sort by year and month
        }
        
    ]);

    // format the monthly earnigs data for easier consumption on the frontend
    const monthlyEarnings = monthlyEarningsResult.map(entry => ({
        month: entry._id.month,
        year: entry._id.year,
        earnings: entry.monthlyEarnings,
    }));

    // send the aggregated data
    res.status(200).json({
        totalOrders,
        totalPrdoucts,
        totalReviews,
        totalUsers,
        totalEarnings,
        monthlyEarnings
    });
    } catch (error) {
        return errorResponse(res, 500, "couldn't get admin stats")
    }

})

module.exports = router;