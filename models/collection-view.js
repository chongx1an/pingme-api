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
    count: {
        type: Number,
        default: 1,
    },
    history: [{
        type: Date,
        default: [Date.now()]
    }]

})

const CollectionView = mongoose.model('CollectionView', schema)

module.exports = CollectionView