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
    
    view: {
        count: {
            type: Number,
            default: 0,
        },
        at: [Date],
    },

    search: {
        count: {
            type: Number,
            default: 0,
        },
        at: [Date],
    },

    addedToCartAt: Date,

    checkoutAt: Date,
    
}, {
    timestamps: true,
})

schema.index({ shop: 1, customerId: 1, productId: 1 }, { unique: true })

const CustomerProduct = mongoose.model('CustomerProduct', schema)

module.exports = CustomerProduct