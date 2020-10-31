const router = require('express').Router()
const crypto = require('crypto')
const { shopify: shopifyConfig } = require('../../config')
const { default: Axios } = require('axios')
const queryString = require('querystring')

router.post('/', async (req, res) => {

    let params = req.requirePermit(['code', 'hmac', 'shop', 'state', 'timestamp'])

    if(params.nonce != shopifyConfig.nonce) {
        return res.status(401)
    }

    const hmac = params.hmac
    delete params.hmac

    let re = new RegExp(/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com[\/]?/)

    if(!re.test(params.shop)) {
        return res.status(401)
    }

    const hmacDigest = crypto.createHmac('sha256', shopifyConfig.apiSecretKey)
    .update(queryString.stringify(params))
    .digest('base64')

    if(hmac != hmacDigest) {
        return res.status(401)
    }

    let { data } = await Axios.post(`https://${shop}/admin/oauth/access_token`, {
        client_id: shopifyConfig.apiKey,
        client_secret: shopifyConfig.apiSecretKey,
        code: params.code,
    }).catch(console.error)

    // store access token

})

module.exports = router