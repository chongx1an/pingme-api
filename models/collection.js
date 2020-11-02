const mongoose = require('mongoose')

const schema = mongoose.Schema({

    id: {
        type: Number,
        required: true,
    },
    shop: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 1,
    }

})

schema.index({ id: 1, shop: 1 }, { unique: true })

const Collection = mongoose.model('Collection', schema)

module.exports = Collection