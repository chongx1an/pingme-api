const mongoose = require('mongoose')

const schema = mongoose.Schema({

    shop: {
        type: String,
        required: true,
    },
    id: {
        type: Number,
        required: true,
    },
    events: [{
        topic: {
            type: String,
            enum: ['view_product', 'view_collection'],
            required: true,
        },
        payload: Object,
        timestamp: {
            type: Date,
            default: Date.now(),
        },
    }],

})

schema.index({ shop: 1, id: 1 }, { unique: true })

const Customer = mongoose.model('Customer', schema)

module.exports = Customer