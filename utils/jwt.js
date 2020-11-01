const jwt = require('jwt-simple')
const { appSecret } = require('../config')

const encode = payload => {

    return jwt.encode(payload, appSecret)

}

const decode = token => {

    return jwt.decode(token, appSecret)

}

module.exports = { encode, decode }