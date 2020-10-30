
let mongoose = require('mongoose')

let WorkspaceSchema = new mongoose.Schema({
  name: String,
  bot_access_token: {
    type: String,
    required: true,
    unique: true
  }
})

module.exports = mongoose.model('Workspace', WorkspaceSchema)