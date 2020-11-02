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
    history: {
        type: [Date],
        default: [Date.now()],
    }

})

schema.index({ shop: 1, customerId: 1, productId: 1 }, { unique: true })

const ProductView = mongoose.model('ProductView', schema)

module.exports = ProductView