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
            enum: ['view_home', 'view_product', 'view_collection', 'add_to_cart'],
            required: true,
        },
        payload: Object,
    }],

})

schema.index({ shop: 1, id: 1 }, { unique: true })

const Customer = mongoose.model('Customer', schema)

module.exports = Customer