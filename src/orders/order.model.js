const mongoose = require('mongoose');
const orderSchema  = new mongoose.Schema({
    // fronted er ordersummery prooceed to checkout btn theke userid r products ashbe
    userId: String,
    orderId: String,
    products: [
        {
            productId: {type: String, required: true},
            quantity: {type: Number, required: true},
        }
    ],
    email: {type: String, required: true},
    amount: Number,
    status: {
    type: String,
    enum: ["pending", "processing", "shipped", "completed"], // Spelling and case fixed
    default: "pending"
    }
}, {timestamps: true})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;