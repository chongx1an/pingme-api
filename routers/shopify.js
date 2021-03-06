const router = require('express').Router()
const Shopify = require('shopify-api-node')
const { Store, Event, CustomerProduct, ProductView } = require('../models')

router.get('/populate', async (_, res) => {

    const events = await Event.find()

    await Promise.all(events.map(event => event.update({ createdAt: event.timestamp })))

    return res.sendStatus(200)

})

router.post('/auth', async (req, res) => {

    const { shop, accessToken } = req.requirePermit(['shop', 'accessToken'])

    let store = await Store.findOne({ provider: 'shopify', shop })

    if(store) {

        await store.update({
            deleted: false,
            accessToken
        })

        return res.sendStatus(200)

    }

    store = await Store.create({
        provider: 'shopify',
        shop,
        accessToken,
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
        }),
        shopifyApi.webhook.create({
            topic: 'orders/create',
            address: 'https://the-pingme-api.herokuapp.com/shopify/webhooks/orders/create',
            format: 'json',
        }),
    ])

    return res.sendStatus(200)

})

router.post('/customer-groups', async (req, res) => {
    const { productId, customerIds } = req.requirePermit(['productId', 'customerIds'])

    const shop = 'posta-show-case.myshopify.com'

    const store = await Store.findOne({ shop })

    const shopifyApi = new Shopify({
        shopName: store.shop,
        accessToken: store.accessToken
    })

    const customerFields = ['id', 'tags'].join(',')
    let customers = await shopifyApi.customer.list({
        ids: customerIds.join(','),
        fields: customerFields
    })

    customers.forEach(async (customer) => {

        let tags = customer.tags.split(",").map(s => s.trim())

        tags = [...new Set([...tags, productId])]
        
        let result = await shopifyApi.customer.update(customer.id, {
            tags: tags,
        })


    })

    const productFields = ['id', 'title'].join(',')
    let product = await shopifyApi.product.get(productId, {
        fields: productFields
    })

    let result = await shopifyApi.customerSavedSearch.create({
        name: `Viewed ${product.id}`,
        query: `tag:'${product.id}'`
    })
    console.log(result)
    return res.json({ success: true })
})

router.get('/products/:productId/view', async (req, res) => {

    const { shop, productId, customerId } = req.requirePermit(['shop', 'productId', 'customerId'])

    await ProductView.findOneAndUpdate({
        shop,
        customerId,
        productId,
    }, {
        $inc: { count: 1 },
        $push: { history: Date.now() },
    }, {
        upsert: true,
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

    await ProductView.findOneAndUpdate({
        shop,
        customerId,
        productId,
    }, {
        inCart: true,
    }, {
        upsert: true,
    })

    return res.sendStatus(200)

})

router.delete('/products/:productId/cart', async (req, res) => {

    const { shop, productId, customerId } = req.requirePermit(['shop', 'productId', 'customerId'])

    await ProductView.findOneAndUpdate({
        shop,
        customerId,
        productId,
    }, {
        inCart: false,
    }, {
        upsert: true,
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

    const params = req.requirePermit(['id', 'customer', 'line_items'])

    const shop = req.get('X-Shopify-Shop-Domain')

    // const data = params.line_items.map(item => ({
    //     shop,
    //     customerId: params.customer.id,
    //     topic: 'begin_checkout',
    //     payload: {
    //         checkoutId: params.id,
    //         productId: item.product_id,
    //     },
    // }))

    // await Event.insertMany(data)
    
    return res.sendStatus(200)

})

router.post('/webhooks/orders/create', async(req, res) => {

    const params = req.requirePermit(['id', 'customer', 'line_items'])

    const shop = req.get('X-Shopify-Shop-Domain')

    // const productIds = params.line_items.map(item => item.product_id)

    // await Event.deleteMany({
    //     shop,
    //     customerId: params.customer.id,
    //     'payload.productId': { $in: productIds },
    // })

    // const data = productIds.map(productId => ({
    //     shop,
    //     customerId: params.customer.id,
    //     topic: 'purchased',
    //     payload: {
    //         productId,
    //     }
    // }))

    // await Event.insertMany(data)

    return res.sendStatus(200)

})

module.exports = router