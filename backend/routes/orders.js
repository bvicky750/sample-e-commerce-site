// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @route   POST /api/orders
// @desc    Create a new order from the user's cart
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { shippingAddress } = req.body;

        const user = await User.findById(userId);
        if (!user || user.cart.length === 0) {
            return res.status(400).json({ msg: 'Cart is empty' });
        }

        // Get full product details for items in cart
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

        // Clear the user's cart
        user.cart = [];
        await user.save();

        res.status(201).json(newOrder);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders
// @desc    Get order history for a user
// @access  Private
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