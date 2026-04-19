const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description : {type: Number, required: true},
    price: {type: Number, required: true, min: 0},
    category: {type:String, required: true, default: 0},
    stock: {type: Number, required: true, min: 0},
    imageUrl: {type: String, required: true},
}, {timestamps: true});

//full-text search
productSchema.index({name: 'text', description: 'text', category: 'text'});

module.exports = mongoose.model('Product', productSchema);