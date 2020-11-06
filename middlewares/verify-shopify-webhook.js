const { shopify: shopifyConfig } = require('../config')
const crypto = require('crypto')

module.exports = async (req, res, next) => {

    const hmac = req.get('X-Shopify-Hmac-Sha256')

    const hashDigest = crypto.createHmac('sha256', shopifyConfig.apiSecretKey)
    .update(req.rawBody)
    .digest('base64')

    if(hmac != hashDigest) {
        return res.error('invalid_hmac', 401)
    }

    next()

}