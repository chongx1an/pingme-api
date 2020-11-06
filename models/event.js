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
    topic: {
        type: String,
        enum: ['view_home', 'view_product', 'view_collection', 'add_to_cart', 'begin_checkout', 'purchased'],
        required: true,
    },
    payload: Object,
    
}, {
    timestamps: true,
})

schema.index({ shop: 1, customerId: 1 })

const Event = mongoose.model('Event', schema)

module.exports = Event