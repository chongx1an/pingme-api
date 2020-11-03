const { shopifyConfig } = require('../config')
const getRawBody = require('raw-body')
const crypto = require('crypto')

module.exports = (req, res, next) => {

    const hmac = req.get('X-Shopify-Hmac-Sha256')

    const body = getRawBody(req)

    const hashDigest = crypto.createHmac('sha256', shopifyConfig.apiSecretKey)
    .update(body, 'utf8', 'hex')
    .digest('base64')

    if(hmac != hashDigest) {
        return res.error('invalid_hmac', 401)
    }

    next()

}