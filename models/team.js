const mongoose = require('mongoose')

const schema = mongoose.Schema({

    id: { type: String, required: true },
    name: { type: String, required: true },
    mainChannelId: { type: String, required: true },
    theme: {
        colors: {
            primary: String,
        }
    },
    accessToken: { type: String, required: true },
    bot: {
        userId: { type: String, required: true },
        accessToken: { type: String, required: true },
    }


}, { timestamps: true })

const Team = mongoose.model('Team', schema)

module.exports = Team