const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('./models/Order');   // Path updated
const User = require('./models/User');     // Path updated
const Product = require('./models/Product'); // Path updated

// @route   POST /api/orders
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { shippingAddress } = req.body;
        const user = await User.findById(userId);
        if (!user || user.cart.length === 0) {
            return res.status(400).json({ msg: 'Cart is empty' });
        }
        const productIds = user.cart.map(item => item.productId);
        const productDetails = await Product.find({ 'id': { $in: productIds } });
        let totalAmount = 0;
        const orderProducts = user.cart.map(cartItem => {
            const product = productDetails.find(p => p.id === cartItem.productId);
            totalAmount += product.price * cartItem.quantity;
            return {
                productId: cartItem.productId,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity
            };
        });
        const newOrder = new Order({
            user: userId,
            products: orderProducts,
            totalAmount,
            shippingAddress
        });
        await newOrder.save();
        user.cart = [];
        await user.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;