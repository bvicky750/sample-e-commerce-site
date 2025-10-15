const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('./models/User'); // Path updated

// @route   POST /api/users/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        user = new User({ name, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'mySecretToken', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token, userName: user.name });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/users/cart
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
router.post('/cart', auth, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const itemIndex = user.cart.findIndex(p => p.productId == productId);
        if (itemIndex > -1) {
            user.cart[itemIndex].quantity += quantity;
        } else {
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
router.delete('/cart/:productId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.cart = user.cart.filter(({ productId }) => productId != req.params.productId);
        await user.save();
        res.json(user.cart);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;