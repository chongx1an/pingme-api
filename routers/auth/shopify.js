const router = require('express').Router()
const crypto = require('crypto')
const { shopify: shopifyConfig } = require('../../config')
const { default: Axios } = require('axios')
const queryString = require('querystring')
const Shop = require('../../models/shop')

router.post('/', async (req, res) => {

    let params = req.requirePermit(['code', 'hmac', 'shop', 'state', 'timestamp'])

    const hmac = params.hmac
    delete params.hmac

    let re = new RegExp(/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com[\/]?/)

    if(!re.test(params.shop)) {
        return res.error('Invalid shop name', 400)
    }

    const hmacDigest = crypto.createHmac('sha256', shopifyConfig.apiSecretKey)
    .update(queryString.stringify(params))
    .digest('hex')

    console.log([hmac, hmacDigest])

    if(hmac != hmacDigest) {
        return res.error('Invalid hmac', 400)
    }

    let response = await Axios.post(`https://${params.shop}/admin/oauth/access_token`, {
        client_id: shopifyConfig.apiKey,
        client_secret: shopifyConfig.apiSecretKey,
        code: params.code,
    }).catch(console.error)

    const shop = await Shop.create({
        provider: 'shopify',
        hostname: params.shop,
        accessToken: response.data.accessToken,
    })

    return res.json({ shop })

})

module.exports = router