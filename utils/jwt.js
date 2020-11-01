const jwt = require('jwt-simple')
const { appSecret } = require('../config')

const encode = payload => jwt.encode(payload, appSecret)

const decode = token => jwt.decode(token, appSecret)

module.exports = { encode, decode }