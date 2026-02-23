const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    category: String,
    description: String,
    price:{
        type: Number,
        required: true
    },
    oldPrice: Number,
    image: {
        type: String,
        required: true
    },
    color: String,
    rating: {
        type: Number,
        default: 0
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // author id
        required: true
    }
}, {
    timestamps: true
})

const Products = mongoose.model("Product", productSchema);

module.exports = Products;