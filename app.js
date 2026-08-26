// imports
const express = require("express") //importing express package
const app = express() // creates a express application
const dotenv = require("dotenv").config() //this allows me to use my .env values in this file
const morgan = require('morgan')
const cors = require('cors')

// Routes Import
const authRoutes = require('./routes/auth.routes')
const addressRoutes = require('./routes/address.routes')
const variantRoutes = require('./routes/variant.routes')
const productRoutes = require('./routes/product.routes')
const loyaltySettingRoutes = require('./routes/loyaltySettings.routes')
const categoryRoutes = require('./routes/category.routes')
const cartRoutes = require('./routes/cart.routes')
const cartItemRoutes = require('./routes/cartItem.routes')


// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
    })
);
app.use(express.json())
app.use(morgan('dev'))



// Routes
app.use('/auth',authRoutes)
app.use('/address', addressRoutes)
app.use('/variants', variantRoutes)
app.use('/products', productRoutes)
app.use('points', loyaltySettingRoutes)


app.use('/categories', categoryRoutes)
app.use('/cart', cartRoutes)
app.use('/cartItem', cartItemRoutes)


module.exports = app