const router = require('express').Router()
const crypto = require('crypto')
const { shopify: shopifyConfig } = require('../config')
const ApiClient = require('../services/api-client')
const queryString = require('querystring')
const Shopify = require('shopify-api-node')
const { Store, Customer, Product, Collection, Event } = require('../models')

router.get('/populate', async (_, res) => {

    const events = await Event.find()

    await Promise.all(events.map(event => event.update({ createdAt: event.timestamp })))

    return res.sendStatus(200)

})

router.post('/auth', async (req, res) => {

    const { shop, accessToken } = req.requirePermit(['shop', 'accessToken'])

    // Upsert store in DB
    const store = await Store.findOneAndUpdate({
        provider: 'shopify',
        shop,
    }, {
        accessToken,
        deleted: false,
    }, {
        new: true,
        upsert: true,
    })

    const shopifyApi = new Shopify({
        shopName: store.shop,
        accessToken: store.accessToken
    })

    await Promise.all([
        shopifyApi.scriptTag.create({
            event: 'onload',
            src: 'https://cdn.jsdelivr.net/gh/chongx1an/pingme-api@latest/script.js',
        }),
        shopifyApi.webhook.create({
            topic: 'app/uninstalled',
            address: 'https://the-pingme-api.herokuapp.com/shopify/webhooks/app/uninstalled',
            format: 'json',
        }),
        shopifyApi.webhook.create({
            topic: 'orders/create',
            address: 'https://the-pingme-api.herokuapp.com/shopify/webhooks/orders/create',
            format: 'json',
        })
    ])

    return res.sendStatus(200)

})

router.get('/install', async (req, res) => {

    const { shop } = req.requirePermit(['shop'])

    if(await Store.exists({ shop })) {
        return res.json({
            // redirectTo: `https://${shop}/admin/apps/${shopifyConfig.apiKey}`
            redirectTo: `https://${shop}/admin/apps/minimo`
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
        redirectTo: `https://${shop}/admin/oauth/authorize?${queryParams}`
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

    // Upsert store in DB
    const store = await Store.findOneAndUpdate({
        provider: 'shopify',
        shop: params.shop,
    }, {
        accessToken: response.data.access_token,
        deleted: false,
    }, {
        new: true,
        upsert: true,
    })

    const shopifyApi = new Shopify({
        shopName: store.shop,
        accessToken: store.accessToken
    })

    await Promise.all([
        shopifyApi.scriptTag.create({
            event: 'onload',
            src: 'https://cdn.jsdelivr.net/gh/chongx1an/pingme-api@latest/script.js',
        }),
        shopifyApi.webhook.create({
            topic: 'app/uninstalled',
            address: 'https://the-pingme-api.herokuapp.com/shopify/webhooks/app/uninstalled',
            format: 'json',
        }),
        shopifyApi.webhook.create({
            topic: 'orders/create',
            address: 'https://the-pingme-api.herokuapp.com/shopify/webhooks/orders/create',
            format: 'json',
        })
    ])

    return res.json({
        redirectTo: `https://${params.shop}/admin/apps/${shopifyConfig.apiKey}`
    })

})

router.get('/home/view', async (req, res) => {

    const { shop, customerId } = req.requirePermit(['shop', 'customerId'])

    await Event.create({
        shop,
        customerId,
        topic: 'view_home',
    })

    return res.sendStatus(200)

})

router.get('/products/:productId/view', async (req, res) => {

    const { shop, productId, customerId } = req.requirePermit(['shop', 'productId', 'customerId'])

    await Event.create({
        shop,
        customerId,
        topic: 'view_product',
        payload: {
            productId,
        }
    })

    return res.sendStatus(200)

})

router.get('/collections/:collectionId/view', async (req, res) => {

    const { shop, collectionId, customerId } = req.requirePermit(['shop', 'collectionId', 'customerId'])

    await Event.create({
        shop,
        customerId,
        topic: 'view_collection',
        payload: {
            collectionId,
        }
    })

    return res.sendStatus(200)

})

router.get('/products/:productId/cart', async (req, res) => {

    const { shop, productId, customerId } = req.requirePermit(['shop', 'productId', 'customerId'])

    await Event.create({
        shop,
        customerId,
        topic: 'add_to_cart',
        payload: {
            productId,
        }
    })

    return res.sendStatus(200)

})

router.use('/webhooks', require('../middlewares/verify-shopify-webhook'))

router.post('/webhooks/app/uninstalled', async(req, res) => {

    const shop = req.get('X-Shopify-Shop-Domain')

    const store = await Store.findOneAndUpdate({ shop }, { deleted: true })

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
    
    return res.sendStatus(200)

})

router.post('/webhooks/checkouts/create', async(req, res) => {

    const params = req.requirePermit(['customer', 'line_items'])

    const shop = req.get('X-Shopify-Shop-Domain')

    const data = params.line_items.map(item => ({
        shop,
        customerId: params.customer.id,
        topic: 'begin_checkout',
        payload: {
            productId: item.product_id,
        },
    }))

    await Event.insertMany(data)
    
    return res.sendStatus(200)

})

router.post('/webhooks/orders/create', async(req, res) => {

    const params = req.requirePermit(['id', 'customer', 'line_items'])

    const shop = req.get('X-Shopify-Shop-Domain')

    const productIds = params.line_items.map(item => item.product_id)

    await Event.deleteMany({
        shop,
        customerId: params.customer.id,
        'payload.productId': { $in: productIds },
    })

    return res.sendStatus(200)

})

module.exports = router