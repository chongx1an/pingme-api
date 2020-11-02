const mongoose = require('mongoose')

const schema = mongoose.Schema({

    provider: {
        type: String,
        required: true,
        enum: ['shopify']
    },
    shop: {
        type: String,
        required: true,
        unique: true,
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