const router = require('express').Router()
const crypto = require('crypto')
const { shopify: shopifyConfig } = require('../config')
const { default: Axios } = require('axios')
const queryString = require('querystring')
const Shopify = require('shopify-api-node')
const Store = require('../models/store')

router.post('/auth', async (req, res) => {

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

    if(hmac != hmacDigest) {
        return res.error('Invalid hmac', 400)
    }

    let response = await Axios.post(`https://${params.shop}/admin/oauth/access_token`, {
        client_id: shopifyConfig.apiKey,
        client_secret: shopifyConfig.apiSecretKey,
        code: params.code,
    })

    const store = await Store.create({
        provider: 'shopify',
        hostName: params.shop,
        accessToken: response.data.access_token,
    })

    return res.json({ store })

})

router.post('/webhooks/app/uninstalled', async(req, res) => {

    const hostName = req.headers['x-shopify-shop-domain']

    const store = await Store.findOne({ hostName })

    const shopify = new Shopify({
        shopName: store.hostName,
        accessToken: store.accessToken
    })

    let res = shopify.scriptTag.list({
        src: 'https://minimo-chatbox.surge.sh/script.js',
    })

    if(res.script_tags.length) {
        await shopify.scriptTag.delete(res.script_tags[0].id)
    }

    return res.send('OK')

})

module.exports = router