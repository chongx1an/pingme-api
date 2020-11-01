const mongoose = require('mongoose')

const schema = mongoose.Schema({

    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    provider: {
        type: String,
        required: true,
        enum: ['shopify']
    },
    hostname: {
        type: String,
        required: true
    },
    accessToken: {
        type: String,
        required: true
    },

}, { timestamps: true })

const Store = mongoose.model('Store', schema)

module.exports = Store