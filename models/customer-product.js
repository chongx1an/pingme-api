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
    
    views: {
        type: [Date],
        default: [],
    },

    searches: {
        type: [Date],
        default: [],
    },

    addedToCartAt: Date,

    checkoutAt: Date,
    
}, {
    timestamps: true,
})

schema.index({ shop: 1, customerId: 1, productId: 1 }, { unique: true })

const CustomerProduct = mongoose.model('CustomerProduct', schema)

module.exports = CustomerProduct