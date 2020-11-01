const router = require('express').Router()
const crypto = require('crypto')
const { shopify: shopifyConfig } = require('../config')
const ApiClient = require('../services/api-client')
const queryString = require('querystring')
const Shopify = require('shopify-api-node')
const { Store, ProductView, CollectionView } = require('../models')

router.get('/install', async (req, res) => {

    const params = req.requirePermit(['hostName'])

    const store = await Store.findOne({ hostName: params.hostName })

    if(store) {
        return res.json({
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

    const shopifyApi = new Shopify({
        shopName: store.hostName,
        accessToken: store.accessToken
    })

    await shopifyApi.scriptTag.create({
        event: 'onload',
        src: 'https://cdn.jsdelivr.net/gh/chongx1an/pingme-api@b26be84/script.js',
    })

    await shopifyApi.webhook.create({
        topic: 'app/uninstalled',
        address: 'https://the-pingme-api.herokuapp.com/shopify/webhooks/app/uninstalled',
        format: 'json',
    })

    return res.json({
        redirectTo: `https://${params.shop}/admin/apps/${shopifyConfig.apiKey}`
    })

})

router.post('/webhooks/app/uninstalled', async(req, res) => {

    const hostName = req.headers['x-shopify-shop-domain']

    const store = await Store.findOne({ hostName })

    const shopifyApi = new Shopify({
        shopName: store.hostName,
        accessToken: store.accessToken
    })

    let response = await shopifyApi.scriptTag.list({
        src: 'https://cdn.jsdelivr.net/gh/chongx1an/pingme-api@b26be84/script.js',
    })

    if(response.script_tags.length) {
        await shopifyApi.scriptTag.delete(response.script_tags[0].id)
    }
    
    return res.send('OK')

})

router.get('/view/products/:productId', async (req, res) => {

    const { productId, customerId } = req.requirePermit(['productId', 'customerId'])

    const view = await ProductView.findOne({
        productId,
        customerId,
    })

    if(view) {

        await view.update({ $push: { history: Date.now() } })

    } else {

        await ProductView.create({
            productId,
            customerId,
        })

    }

    return res.send('OK')

})

router.get('/view/collections/:collectionId', async (req, res) => {

    const { collectionId, customerId } = req.requirePermit(['collectionId', 'customerId'])

    const view = await CollectionView.findOne({
        collectionId,
        customerId,
    })

    if(view) {

        await view.update({ $push: { history: Date.now() } })

    } else {

        await CollectionView.create({
            collectionId,
            customerId,
        })

    }

    return res.send('OK')

})

module.exports = router