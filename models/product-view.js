const mongoose = require('mongoose')

const schema = mongoose.Schema({

    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
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

const ProductView = mongoose.model('ProductView', schema)

module.exports = ProductView