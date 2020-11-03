const router = require('express').Router()
const crypto = require('crypto')
const { shopify: shopifyConfig } = require('../config')
const ApiClient = require('../services/api-client')
const queryString = require('querystring')
const Shopify = require('shopify-api-node')
const { Store, Customer, Product, Collection } = require('../models')

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
            topic: 'checkouts/create',
            address: 'https://the-pingme-api.herokuapp.com/shopify/webhooks/checkouts/create',
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
            topic: 'checkouts/create',
            address: 'https://the-pingme-api.herokuapp.com/shopify/webhooks/checkouts/create',
            format: 'json',
        })
    ])

    return res.json({
        redirectTo: `https://${params.shop}/admin/apps/${shopifyConfig.apiKey}`
    })

})

router.get('/products/:productId/view', async (req, res) => {

    const { shop, productId, customerId } = req.requirePermit(['shop', 'productId', 'customerId'])

    await Promise.all([

        Customer.findOneAndUpdate({
            id: customerId,
            shop,
        }, {
            $push: {
                events: {
                    topic: 'view_product',
                    payload: {
                        productId,
                    },
                }
            }
        }, {
            upsert: true,
        }),

        Product.findOneAndUpdate({
            id: productId,
            shop,
        }, {
            $inc: { views: 1 },
        }, {
            upsert: true
        })

    ])

    return res.sendStatus(200)

})

router.get('/collections/:collectionId/view', async (req, res) => {

    const { shop, collectionId, customerId, duration } = req.requirePermit(['shop', 'collectionId', 'customerId'])

    await Promise.all([

        Customer.findOneAndUpdate({
            id: customerId,
            shop,
        }, {
            $push: {
                events: {
                    topic: 'view_collection',
                    payload: {
                        collectionId,
                    },
                }
            }
        }, {
            upsert: true,
        }),

        Collection.findOneAndUpdate({
            id: collectionId,
            shop,
        }, {
            $inc: { views: 1 },
        }, {
            upsert: true
        })

    ])

    return res.sendStatus(200)

})

router.get('/products/:productId/cart', async (req, res) => {

    await Customer.findOneAndUpdate({
        id: customerId,
        shop
    }, {
        $push: {
            events: {
                topic: 'add_to_cart',
                payload: {
                    productId,
                },
            }
        }
    }, {
        upsert: true,
    })

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

    const { line_items } = req.requirePermit(['line_items'])

    // await ProductView.updateMany({
    //     customerId: line_items[0].customer.id,
    //     productId: line_items.map(item => item.product_id)
    // }, {
    //     lastBoughtAt: Date.now(),
    // })
    
    return res.sendStatus(200)

})

module.exports = router