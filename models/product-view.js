const mongoose = require('mongoose')

const schema = mongoose.Schema({

    shop: {
        type: String,
        required: true,
    },
    customerId: {
        type: Number,
        required: true,
    },
    productId: {
        type: Number,
        required: true,
    },
    count: {
        type: Number,
        default: 1,
    },
    history: {
        type: [Date],
        default: [Date.now()],
    },
    inCart: {
        type: Boolean,
        default: false,
    },
    lastPurchasedAt: Date,

}, { timestamps: true })

schema.index({ shop: 1, customerId: 1, productId: 1 })

const ProductView = mongoose.model('ProductView', schema, 'product_views')

module.exports = ProductView