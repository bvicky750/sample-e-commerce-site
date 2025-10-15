require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./db');

const products = [
    { id: 1, name: 'Wireless Headphones', price: 2499, image: 'images/headphones.jpg', description: 'High-fidelity wireless headphones with noise-cancellation and a 20-hour battery life.' },
    { id: 2, name: 'Smartwatch Series 7', price: 14999, image: 'images/smartwatch.jpg', description: 'The latest smartwatch with a larger display, advanced health sensors, and faster charging.' },
    { id: 3, name: 'Ergonomic Mouse', price: 1899, image: 'images/mouse.jpg', description: 'A comfortable ergonomic mouse designed to reduce strain, featuring customizable buttons.' },
    { id: 4, name: 'Mechanical Keyboard', price: 4500, image: 'images/mechanicalkey.jpg', description: 'A durable mechanical keyboard with satisfying tactile feedback and RGB backlighting.' },
    { id: 5, name: '4K Ultra HD Monitor', price: 22500, image: 'images/monitor.jpg', description: 'A stunning 27-inch 4K monitor with vibrant colors and sharp details.' },
    { id: 6, name: 'Portable SSD 1TB', price: 6999, image: 'images/ssd.webp', description: 'A fast and compact 1TB portable SSD for transferring large files in seconds.' },
    { id: 7, name: 'Leather Backpack', price: 3499, image: 'images/backpack.jpg', description: 'A stylish and functional leather backpack with a padded laptop sleeve.' },
    { id: 8, name: 'Insulated Water Bottle', price: 799, image: 'images/bottle.webp', description: 'Keep your drinks cold for 24 hours or hot for 12 hours with this sleek bottle.' },
    { id: 9, name: 'Gaming Console', price: 45000, image: 'images/game.jpg', description: 'Next-generation gaming console for an immersive 4K gaming experience.' },
    { id: 10, name: 'Bluetooth Speaker', price: 2999, image: 'images/speaker.webp', description: 'A portable Bluetooth speaker with rich bass and 360-degree sound. Waterproof.' },
    { id: 11, name: 'Espresso Machine', price: 8990, image: 'images/coffe.jpg', description: 'A compact espresso machine to brew barista-quality coffee at home.' },
    { id: 12, name: 'Yoga Mat', price: 1299, image: 'images/yoga.jpg', description: 'A premium, non-slip yoga mat that provides excellent cushioning and support.' },
];

const seedDB = async () => {
    await connectDB();
    try {
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();