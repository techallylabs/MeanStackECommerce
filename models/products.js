const mongoose = require('mongoose');
const { Category } = require('./categories');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    images: [{
        type: String,
        default: ""
    }],
    brand: {
        type: String,
        default: ""
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    countInStock: {
        type: Number,
        required: true
    },
    rating: {
        type: Number
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    numReviews: {
        type: Number,
        defaut: false
    }
});

productSchema.virtual("id").get(function(){
    return this._id.toHexString();
})

productSchema.set('toJSON', {
    virtual: true
})

exports.Product = mongoose.model('Product',productSchema);