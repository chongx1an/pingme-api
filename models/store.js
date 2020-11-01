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
    hostName: {
        type: String,
        required: true,
        unique: true,
    },
    accessToken: {
        type: String,
        required: true
    },

}, { timestamps: true })

const Store = mongoose.model('Store', schema)

module.exports = Store