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

schema.methods.tokenize = function() {
    const jwt = require('../utils/jwt')
    return jwt.encode({
        aud: 'https://the-pingme-api.herokuapp.com/shopify',
        iss: 'https://the-pingme-api.herokuapp.com/shopify',
        sub: this._id,
        at: Date.now(),
    })
}

const Store = mongoose.model('Store', schema)

module.exports = Store