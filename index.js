const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors');
// getting-started.js
const mongoose = require('mongoose');

//1. middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://fashions-ecommerce.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(cookieParser())
app.use(bodyParser.json())


const UploadImage = require('./src/utilis/UploadImage')
//2. routes

const userRoutes = require("./src/users/user.routes");
const productsRoutes = require("./src/products/product.route")
const reviewsRoutes = require('./src/reviews/review.route')
const ordersRoutes = require('./src/orders/order.route')
const statsRoutes = require('./src/stats/stats.route')

app.use('/api/auth', userRoutes);
app.use('/api/products', productsRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/stats', statsRoutes)

app.get('/', (req, res) => {
  res.send('home page')
})

async function main() {
    try {
        await mongoose.connect(process.env.URL);
        console.log("Mongodb Connected Succesfully")
    } catch (error) {
        console.log("Error Failed", error)
    }

}
main();

// upload image api
app.post('/uploadImage', async(req, res)=> {
    await UploadImage(req.body.image)
    .then((url) => res.send(url))
    .catch((error) => res.status(500).send(error));
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
