const mongoose = require('mongoose')

const schema = mongoose.Schema({

    id: {
        type: Number,
        required: true,
    },
    shop: {
        type: String,
        required: true,
    },
    products: [{
        id: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0
        },
        firstViewedAt: Date,
        lastViewedAt: Date,
        lastPurchasedAt: Date,
    }]

}, { timestamps: true })

const Customer = mongoose.model('Customer', schema)

module.exports = Customer