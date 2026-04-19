const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
 
// GET all products
router.get('/', async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const { category, minPrice, maxPrice, search } = req.query;
 
        let query = { isActive: true };
 
        if (category) query.category = category;
 
        if (minPrice || maxPrice) {          
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
 
        if (search) query.$text = { $search: search };
 
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find(query).skip(skip).limit(limit),
            Product.countDocuments(query),
        ]);
 
        res.json({ products, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
 
// GET single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
 
// POST create product
router.post('/', async (req, res) => {
    try {
        // Destructure only the fields you expect instead of passing req.body directly
        const { name, description, price, category, stock, images } = req.body;
        const product = new Product({ name, description, price, category, stock, images });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
 
// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const { name, description, price, category, stock, images } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, category, stock, images },
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ error: 'Not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
 
// DELETE product (soft delete — marks inactive)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate( 
            req.params.id,
            { isActive: false }
        );
        if (!product) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
 
// PATCH update stock only
router.patch('/:id/stock', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { stock: req.body.quantity } },
            { new: true }
        );
        if (!product) return res.status(404).json({ error: 'Not found' }); 
        res.json({ stock: product.stock });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
 
module.exports = router;
 