const router = require('express').Router()
const crypto = require('crypto')
const { shopify: shopifyConfig } = require('../config')
const ApiClient = require('../services/api-client')
const queryString = require('querystring')
const Shopify = require('shopify-api-node')
const Store = require('../models/store')
const View = require('../models/view')

router.get('/install', async (req, res) => {

    const params = req.requirePermit(['hostName'])

    const store = await Store.findOne({ hostName: params.hostName })

    if(store) {
        return res.json({
            token: store.tokenize(),
            redirectTo: `https://${params.hostName}/admin/apps/${shopifyConfig.apiKey}`
        })
    }

    const scope = ['read_products', 'read_customers', 'read_orders', 'write_script_tags'].join(',')

    const queryParams = queryString.stringify({
        client_id: shopifyConfig.apiKey,
        scope,
        redirect_uri: 'https://minimo-admin.netlify.app/shopify/oauth',
        state: shopifyConfig.nonce,
    })

    return res.json({
        redirectTo: `https://${params.hostName}/admin/oauth/authorize?${queryParams}`
    })

})

router.get('/auth', async (req, res) => {

    console.log('AUTH')

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

    let response = await ApiClient.post(`https://${params.shop}/admin/oauth/access_token`, {
        client_id: shopifyConfig.apiKey,
        client_secret: shopifyConfig.apiSecretKey,
        code: params.code,
    })

    const store = await Store.create({
        provider: 'shopify',
        hostName: params.shop,
        accessToken: response.data.access_token,
    })

    console.log(4)

    return res.json({
        token: store.tokenize(),
        redirectTo: `https://${params.shop}/admin/apps/${shopifyConfig.apiKey}`
    })

})

router.post('/webhooks/app/uninstalled', async(req, res) => {

    const hostName = req.headers['x-shopify-shop-domain']

    const store = await Store.findOne({ hostName })

    const shopify = new Shopify({
        shopName: store.hostName,
        accessToken: store.accessToken
    })

    let response = shopify.scriptTag.list({
        src: 'https://minimo-chatbox.surge.sh/script.js',
    })

    if(response.script_tags.length) {
        await shopify.scriptTag.delete(response.script_tags[0].id)
    }

    return res.send('OK')

})

router.get('/track', async (req, res) => {

    const params = req.requirePermit(['kind', 'itemId', 'customerId'])

    const view = await View.create({
        kind: params.kind,
        itemId: params.itemId,
        customerId: params.customerId,
    })

    return res.json({ view })

})

module.exports = router