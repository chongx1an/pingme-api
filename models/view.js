const mongoose = require('mongoose')

const schema = mongoose.Schema({

    customerId: {
        type: Number,
        required: true,
    },
    kind: {
        type: String,
        enum: ['product', 'collection'],
        required: true,
    },
    itemId: {
        type: Number,
        required: true,
    },

}, { timestamps: true })

const View = mongoose.model('View', schema)

module.exports = View