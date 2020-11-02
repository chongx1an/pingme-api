const mongoose = require('mongoose')

const schema = mongoose.Schema({

    provider: {
        type: String,
        required: true,
        enum: ['shopify']
    },
    accessToken: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true })

const Store = mongoose.model('Store', schema)

module.exports = Store