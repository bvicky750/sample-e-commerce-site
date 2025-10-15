// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Import our auth middleware
const User = require('../models/User');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    // ... this function is unchanged
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) { return res.status(400).json({ msg: 'User already exists' }); }
        user = new User({ name, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (error) { console.error(error.message); res.status(500).send('Server error'); }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    // ... this function is unchanged
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) { return res.status(400).json({ msg: 'Invalid credentials' }); }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(400).json({ msg: 'Invalid credentials' }); }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'mySecretToken', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token, userName: user.name });
        });
    } catch (error) { console.error(error.message); res.status(500).send('Server error'); }
});


// --- NEW CART ROUTES ---

// @route   GET /api/users/cart
// @desc    Get user's cart
// @access  Private
router.get('/cart', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.cart);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/users/cart
// @desc    Add item to cart
// @access  Private
router.post('/cart', auth, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const itemIndex = user.cart.findIndex(p => p.productId == productId);

        if (itemIndex > -1) {
            // Product exists in cart, update quantity
            user.cart[itemIndex].quantity += quantity;
        } else {
            // Product does not exist in cart, add new item
            user.cart.push({ productId, quantity });
        }
        await user.save();
        res.json(user.cart);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/users/cart/:productId
// @desc    Remove an item from the cart
// @access  Private
router.delete('/cart/:productId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.cart = user.cart.filter(
            ({ productId }) => productId != req.params.productId
        );
        await user.save();
        res.json(user.cart);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;