const mongoose = require('mongoose')

const schema = mongoose.Schema({

    customerId: {
        type: Number,
        required: true,
    },
    collectionId: {
        type: Number,
        required: true,
    },
    history: {
        type: [Date],
        default: [Date.now()],
    }

})

const CollectionView = mongoose.model('CollectionView', schema)

module.exports = CollectionView