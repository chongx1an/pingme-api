const mongoose = require('mongoose')

const schema = mongoose.Schema({

    id: { type: String, required: true },
    name: { type: String, required: true },
    userId: { type: String, required: true },
    mainChannelId: { type: String, required: true },
    bot: {
        userId: { type: String, required: true },
        accessToken: { type: String, required: true },
    },
    incomingWebhookUrl: { type: String, required: true },
    theme: {
        colors: {
            primary: String,
        }
    },

}, { timestamps: true })

const Team = mongoose.model('Team', schema)

module.exports = Team