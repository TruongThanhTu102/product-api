
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const app = express();
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Kiểm tra API đang hoạt động
app.get('/', (req, res) => {
    res.json({ message: 'Product API is running' });
});

// Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Lấy sản phẩm theo mã
app.get('/api/products/:pid', async (req, res) => {
    try {
        const product = await Product.findOne({ pid: req.params.pid });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Thêm sản phẩm
app.post('/api/products', async (req, res) => {
    try {
        const product = new Product({
            pid: req.body.pid,
            pname: req.body.pname,
            price: req.body.price,
            quantity: req.body.quantity
        });

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Product ID already exists' });
        }

        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }

        res.status(500).json({ message: err.message });
    }
});

// Cập nhật sản phẩm theo mã
app.put('/api/products/:pid', async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { pid: req.params.pid },
            {
                pname: req.body.pname,
                price: req.body.price,
                quantity: req.body.quantity
            },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Xóa sản phẩm theo mã
app.delete('/api/products/:pid', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            pid: req.params.pid
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Khởi động server sau khi kết nối MongoDB thành công
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await mongoose.connection.asPromise();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Cannot start server:', err.message);
        process.exit(1);
    }
}

startServer();

module.exports = app;
