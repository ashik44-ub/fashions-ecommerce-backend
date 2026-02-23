// const { BASE_URL } = require("../utilis/baseURL");
// const { errorResponse } = require("../utilis/responseHandler");
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


// const makePaymentRequest = async(req, res)=> {

//     const {products, userId} = req.body;
    
//     try {
//         const lineItems = products.map((product)=> ({
//         price_data: {
//             currency: "usd",
//             product_data: {
//                 name: product.name,
//                 images: [product.image]
//             },
//             unit_amount: Math.round(product.price * 100)
//         },
//         quantity: product.quantity
//         }))
//         const session = await stripe.checkout.sessions.create({
//             line_items:lineItems,
//             payment_method_types: ["card"],
//             mode: 'payment',
//             success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${BASE_URL}/cancel`
//         });
//         res.json({id: session.id})
//     } catch (error) {
//         return errorResponse(res, 500, "Failed to Create Payment Session", error)
//     }

// }

// module.exports = {
//     makePaymentRequest
// }

const { BASE_URL } = require("../utilis/baseURL");
const { errorResponse, successResponse } = require("../utilis/responseHandler");
const Order = require("./order.model");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const makePaymentRequest = async(req, res)=> {
    const {products, userId} = req.body;
    
    try {
        const lineItems = products.map((product)=> ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: product.name,
                    images: [product.image]
                },
                unit_amount: Math.round(product.price * 100)
            },
            quantity: product.quantity
        }));

        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            payment_method_types: ["card"],
            mode: 'payment',
            // এখানে metadata যোগ করলে পরবর্তীতে পেমেন্ট ভেরিফাই করতে সুবিধা হবে
            metadata: {
                userId: userId
            },
            success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${BASE_URL}/cancel`
        });

        // 🔥 এখানে পরিবর্তন: শুধু id না পাঠিয়ে url-ও পাঠান
        res.json({
            id: session.id,
            url: session.url // ফ্রন্টএন্ডে এটিই ব্যবহার হবে
        });

    } catch (error) {
        console.error("Stripe Error:", error);
        return errorResponse(res, 500, "Failed to Create Payment Session", error);
    }
}


const confirmPayment = async (req, res) => {
  const {session_id} = req.body;
  console.log(session_id)
  try {
    const session =  await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "payment_intent"]
    })
    const paymentIntentId = session.payment_intent.id;
    let order =  await Order.findOne({orderId: paymentIntentId})

    if(!order){
      const lineItems = session.line_items.data.map((item) => ({
        productId: item.price.product,
        quantity: item.quantity
      }))

      const amount = session.amount_total / 100;
      
      order= new Order({
        orderId: paymentIntentId,
        products:lineItems,
        amount: amount,
        email: session.customer_details.email,
        status: session.payment_intent.status === "succeeded" ? "pending" : "failed",
      })

    } else {
      order.status = session.payment_intent.status === "succeeded" ? "pending" : "failed"
    }

    await order.save()
    return successResponse(res, 200, "Order confirmed successfully", order)


  } catch (error) {
    return errorResponse(res, 500, "Failed to confirmed payment", error);
  }
}


// email fetch
const getordersByemail = async(req, res) => {
    const email = req.params.email;

    try {
        if(!email){
            return errorResponse(res, 400, "Email is Required"); 
        }

        // ✅ সমাধান: .sort() মেথডটি await-এর আগে ডাটাবেজ কোয়েরির সাথে লিখুন
        const orders = await Order.find({ email }).sort({ createdAt: -1 });

        if(!orders || orders.length === 0){
            return errorResponse(res, 404, "No orders found for this email");
        }

        // ✅ এখানে orders ভেরিয়েবলটি পাঠাতে ভুলবেন না
        return successResponse(res, 200, "Order Fetch Successfully!", orders); 

    } catch (error) {
        // error.message দিলে এররটি পরিষ্কার বোঝা যাবে
        return errorResponse(res, 500, "Failed to get orders", error.message);
    }
}

// get order by id
const getOrderById = async(req, res)=> {
    try {
        const order = await Order.findById(req.params.id);
        if(!order){
            return errorResponse(res, 500, "Order no found");
        }
        return successResponse(res, 200, "Order Id Fetch Successfully!", order);
    } catch (error) {
        return errorResponse(res, 500, "Failed to get order by id", error);
    }
}


// get all orders
const getAllOrders = async(req, res)=> {
    try {
        const orders = await Order.find().sort({createdAt: -1});
        if(!orders || orders.length === 0){
            return errorResponse(res, 404, "No orders found");
        }
        return successResponse(res, 200, "Get All Orders Successfully!", orders);
    } catch (error) {
        return errorResponse(res, 500, "Failed to get all orders", error);
    }
}

//update order status
const updateOrderStatus = async (req, res) => {
  const {id} = req.params;
  const {status} = req.body;
  if(!status) {
    return errorResponse(res, 400, "Status is required")
  }
  try {
    const updatedOrder = await Order.findByIdAndUpdate(id, {status, updatedAt: Date.now()}, {
      new: true,
      runValidators: true,
    })

    if(!updatedOrder) {
      return errorResponse(res, 404, "Order not found")
    }

    return successResponse(res, 200, "Order status updated successfully", updatedOrder)
  } catch (error) {
    return errorResponse(res, 500, "Failed to update order status", error)
  }
}

// delete order
const deleteOrderById = async(req, res)=> {
    const {id} = req.params;
    try {
        const deleteOrder = await Order.findByIdAndDelete(id);
        if(!deleteOrder){
            return errorResponse(res, 500, "Order not found", deleteOrder);
        }
        return successResponse(res, 200, "Order Deleted Successfully!", deleteOrder);
    } catch (error) {
        return errorResponse(res, 500, "Failed to update order status", error);
    }
}


module.exports = {
    makePaymentRequest,
    confirmPayment,
    getordersByemail,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    deleteOrderById
}