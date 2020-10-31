const mongoose = require('mongoose')

const schema = mongoose.Schema({

    id: {
        type: String,
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    channelId: {
        type: String,
        required: true
    },

}, { timestamps: true })

const Thread = mongoose.model('Thread', schema)

module.exports = Thread