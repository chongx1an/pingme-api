
let mongoose = require('mongoose')

let WorkspaceSchema = new mongoose.Schema({
  team_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  access_token: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Workspace', WorkspaceSchema)