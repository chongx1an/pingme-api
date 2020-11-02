const router = require('express').Router()
const crypto = require('crypto')
const { shopify: shopifyConfig } = require('../config')
const ApiClient = require('../services/api-client')
const queryString = require('querystring')
const Shopify = require('shopify-api-node')
const { Store, ProductView, CollectionView } = require('../models')
const getRawBody = require('raw-body')

router.get('/install', async (req, res) => {

    const params = req.requirePermit(['shop'])

    const store = await Store.findOne({ shop: params.shop })

    if(store) {
        return res.json({
            redirectTo: `https://${params.shop}/admin/apps/${shopifyConfig.apiKey}`
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
        redirectTo: `https://${params.shop}/admin/oauth/authorize?${queryParams}`
    })

})

router.get('/auth', async (req, res) => {

    let params = req.requirePermit(['code', 'hmac', 'shop', 'state', 'timestamp'])

    let re = new RegExp(/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com[\/]?/)

    if(!re.test(params.shop)) {
        return res.error('invalid_shop_name', 400)
    }

    // Verify hmac
    const hmac = params.hmac
    delete params.hmac

    const hmacDigest = crypto.createHmac('sha256', shopifyConfig.apiSecretKey)
    .update(queryString.stringify(params))
    .digest('hex')

    if(hmac != hmacDigest) {
        return res.error('invalid_hmac', 400)
    }

    // Get access token
    let response = await ApiClient.post(`https://${params.shop}/admin/oauth/access_token`, {
        client_id: shopifyConfig.apiKey,
        client_secret: shopifyConfig.apiSecretKey,
        code: params.code,
    })

    // Create store in DB
    const store = await Store.findByIdAndUpdate({
        _id: params.shop,
        provider: 'shopify',
    }, {
        accessToken: response.data.access_token,
        deleted: false,
    }, {
        upsert: true,
    })

    const shopifyApi = new Shopify({
        shopName: store._id,
        accessToken: store.accessToken
    })

    // Create script tag
    await shopifyApi.scriptTag.create({
        event: 'onload',
        src: 'https://cdn.jsdelivr.net/gh/chongx1an/pingme-api@latest/script.js',
    })

    // Create uninstall app webhook
    await shopifyApi.webhook.create({
        topic: 'app/uninstalled',
        address: 'https://the-pingme-api.herokuapp.com/shopify/webhooks/app/uninstalled',
        format: 'json',
    })

    return res.json({
        redirectTo: `https://${params.shop}/admin/apps/${shopifyConfig.apiKey}`
    })

})

router.get('/view/products/:productId', async (req, res) => {

    const { shop, productId, customerId } = req.requirePermit(['shop', 'productId', 'customerId'])

    await ProductView.findOneAndUpdate({
        storeId: shop,
        productId,
        customerId,
    }, {
        $push: { history: Date.now() }
    }, {
        upsert: true,
    })

    return res.send('OK')

})

router.get('/view/collections/:collectionId', async (req, res) => {

    const { shop, collectionId, customerId } = req.requirePermit(['shop', 'collectionId', 'customerId'])

    await CollectionView.findOneAndUpdate({
        storeId: shop,
        collectionId,
        customerId,
    }, {
        $push: { history: Date.now() }
    }, {
        upsert: true,
    })

    return res.send('OK')

})

router.post('/webhooks/app/uninstalled', async(req, res) => {

    // Verify hmac
    const hmac = req.get('X-Shopify-Hmac-Sha256')

    const body = getRawBody(req)

    const hashDigest = crypto.createHmac('sha256', shopifyConfig.apiSecretKey)
    .update(body, 'utf8', 'hex')
    .digest('base64')

    if(hmac != hashDigest) {
        return res.error('invalid_hmac', 401)
    }

    const shop = req.headers['x-shopify-shop-domain']

    const shopifyApi = new Shopify({
        shopName: shop,
        accessToken: store.accessToken
    })

    // Find and delete script tag
    let response = await shopifyApi.scriptTag.list({
        src: 'https://cdn.jsdelivr.net/gh/chongx1an/pingme-api@latest/script.js',
    })

    if(response.script_tags.length) {
        await shopifyApi.scriptTag.delete(response.script_tags[0].id)
    }

    // Soft delete store
    await Store.findByIdAndUpdate(shop, { deleted: true })
    
    return res.send('OK')

})

module.exports = router