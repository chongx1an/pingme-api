const { shopify: shopifyConfig } = require('../config')
const getRawBody = require('raw-body')
const crypto = require('crypto')

module.exports = async (req, res, next) => {

    const hmac = req.get('X-Shopify-Hmac-Sha256')

    console.log(hmac)

    const body = await getRawBody(req)

    console.log(body)

    const hashDigest = crypto.createHmac('sha256', shopifyConfig.apiSecretKey)
    .update(Buffer.from(body), 'utf8')
    .digest('base64')

    console.log([hmac, hashDigest])

    if(hmac != hashDigest) {
        return res.error('invalid_hmac', 401)
    }

    next()

}