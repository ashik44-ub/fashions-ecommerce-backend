const express = require('express');
const { makePaymentRequest, confirmPayment, getordersByemail, getOrderById, getAllOrders, updateOrderStatus, deleteOrder, deleteOrderById } = require('./order.controller');

const router = express.Router();

// create checkout session
router.post('/create-checkout-session', makePaymentRequest)

// confirm payment
router.post("/confirm-payment", confirmPayment)

// get order by emailc
router.get("/:email", getordersByemail)


// get orders by id
router.get('/order/:id', getOrderById)

// get all orders
router.get('/', getAllOrders)

// update order status
router.patch('/update-order-status/:id', updateOrderStatus)

// delete order
router.delete('/delete-order/:id', deleteOrderById)


module.exports = router;