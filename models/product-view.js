const mongoose = require('mongoose')

const schema = mongoose.Schema({

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

const ProductView = mongoose.model('ProductView', schema)

module.exports = ProductView