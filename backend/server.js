// backend/server.js - ALL-IN-ONE FINAL VERSION
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// --- DATABASE CONNECTION ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};
connectDB();

// --- DATABASE MODELS ---
const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true }
});
const Product = mongoose.model('Product', ProductSchema);

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cart: [{ productId: { type: Number, required: true }, quantity: { type: Number, required: true, default: 1 } }],
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ productId: { type: Number, required: true }, name: { type: String, required: true }, price: { type: Number, required: true }, quantity: { type: Number, required: true } }],
    totalAmount: { type: Number, required: true },
    shippingAddress: { fullName: { type: String, required: true }, address: { type: String, required: true }, city: { type: String, required: true }, pincode: { type: String, required: true } },
    orderDate: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) { return res.status(401).json({ msg: 'No token, authorization denied' }); }
    try {
        const decoded = jwt.verify(token, 'mySecretToken');
        req.user = decoded.user;
        next();
    } catch (err) { res.status(401).json({ msg: 'Token is not valid' }); }
};

// --- API ROUTES ---

// Product Routes
app.get('/api/products', async (req, res) => { try { const products = await Product.find().sort({ id: 1 }); res.json(products); } catch (e) { res.status(500).send('Server Error'); } });
app.get('/api/products/search', async (req, res) => { try { const query = req.query.q; if (!query) { const products = await Product.find().sort({ id: 1 }); return res.json(products); } const products = await Product.find({ name: { $regex: query, $options: 'i' } }); res.json(products); } catch (e) { res.status(500).send('Server Error'); } });

// User Routes
app.post('/api/users/register', async (req, res) => { const { name, email, password } = req.body; try { let user = await User.findOne({ email }); if (user) { return res.status(400).json({ msg: 'User already exists' }); } user = new User({ name, email, password }); const salt = await bcrypt.genSalt(10); user.password = await bcrypt.hash(password, salt); await user.save(); res.status(201).json({ msg: 'User registered successfully' }); } catch (e) { res.status(500).send('Server error'); } });
app.post('/api/users/login', async (req, res) => { const { email, password } = req.body; try { const user = await User.findOne({ email }); if (!user) { return res.status(400).json({ msg: 'Invalid credentials' }); } const isMatch = await bcrypt.compare(password, user.password); if (!isMatch) { return res.status(400).json({ msg: 'Invalid credentials' }); } const payload = { user: { id: user.id } }; jwt.sign(payload, 'mySecretToken', { expiresIn: 3600 }, (err, token) => { if (err) throw err; res.json({ token, userName: user.name }); }); } catch (e) { res.status(500).send('Server error'); } });

// Cart Routes
app.get('/api/users/cart', authMiddleware, async (req, res) => { try { const user = await User.findById(req.user.id); res.json(user.cart); } catch (e) { res.status(500).send('Server Error'); } });
app.post('/api/users/cart', authMiddleware, async (req, res) => { const { productId, quantity } = req.body; try { const user = await User.findById(req.user.id); const itemIndex = user.cart.findIndex(p => p.productId == productId); if (itemIndex > -1) { user.cart[itemIndex].quantity += quantity; } else { user.cart.push({ productId, quantity }); } await user.save(); res.json(user.cart); } catch (e) { res.status(500).send('Server Error'); } });
app.delete('/api/users/cart/:productId', authMiddleware, async (req, res) => { try { const user = await User.findById(req.user.id); user.cart = user.cart.filter(({ productId }) => productId != req.params.productId); await user.save(); res.json(user.cart); } catch (e) { res.status(500).send('Server Error'); } });

// Order Routes
app.post('/api/orders', authMiddleware, async (req, res) => { try { const userId = req.user.id; const { shippingAddress } = req.body; const user = await User.findById(userId); if (!user || user.cart.length === 0) { return res.status(400).json({ msg: 'Cart is empty' }); } const productIds = user.cart.map(item => item.productId); const productDetails = await Product.find({ 'id': { $in: productIds } }); let totalAmount = 0; const orderProducts = user.cart.map(cartItem => { const product = productDetails.find(p => p.id === cartItem.productId); totalAmount += product.price * cartItem.quantity; return { productId: cartItem.productId, name: product.name, price: product.price, quantity: cartItem.quantity }; }); const newOrder = new Order({ user: userId, products: orderProducts, totalAmount, shippingAddress }); await newOrder.save(); user.cart = []; await user.save(); res.status(201).json(newOrder); } catch (e) { res.status(500).send('Server Error'); } });
app.get('/api/orders', authMiddleware, async (req, res) => { try { const orders = await Order.find({ user: req.user.id }).sort({ orderDate: -1 }); res.json(orders); } catch (e) { res.status(500).send('Server Error'); } });

// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '../frontend', 'index.html')); });

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});