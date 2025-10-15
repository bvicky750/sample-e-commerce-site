const express = require('express');
const router = express.Router();
const Product = require('./models/Product'); // Path updated

// @route   GET /api/products
// @desc    Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ id: 1 });
        res.json(products);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/products/search
// @desc    Search for products by name
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            const products = await Product.find().sort({ id: 1 });
            return res.json(products);
        }
        const products = await Product.find({ name: { $regex: query, $options: 'i' } });
        res.json(products);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;