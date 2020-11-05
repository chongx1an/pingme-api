const router = require('express').Router()
const Shopify = require('shopify-api-node')
const { Event } = require('../models')
const Store = require('../models/store')

router.get('/', async (req, res) => {

    const store = await Store.findOne()

    let productViews = await Event.aggregate([
        {
            $match: {
                topic: 'view_product',
            }
        },
        {
            $group: {
                _id: { customerId: '$customerId', productId: '$payload.productId' },
                views: { $sum: 1 },
            },
        },
        {
            $match: {
                views: { $gte: 2 },
            },
        },
        {
            $project: {
                _id: 0,
                customerId: '$_id.customerId',
                productId: '$_id.productId',
                views: 1
            }
        }
    ])

    let collectionViews = await Event.aggregate([
        {
            $match: {
                topic: 'view_collection',
            }
        },
        {
            $group: {
                _id: { customerId: '$customerId', collectionId: '$payload.collectionId' },
                views: { $sum: 1 },
            },
        },
        {
            $match: {
                views: { $gte: 2 },
            },
        },
        {
            $project: {
                _id: 0,
                customerId: '$_id.customerId',
                collectionId: '$_id.collectionId',
                views: 1
            }
        }
    ])

    const shopifyApi = new Shopify({
        shopName: store.shop,
        accessToken: store.accessToken
    })

    const customerIds = [...productViews.map(view => view.customerId), ...collectionViews.map(view => view.customerId)].join(',')
    const customerFields = ['id', 'first_name', 'last_name', 'orders_count'].join(',')

    const customers = await shopifyApi.customer.list({
        ids: customerIds,
        fields: customerFields,
    })

    const productIds = [...productViews.map(view => view.productId), ...collectionViews.map(view => view.productId)].join(',')
    const productFields = ['id', 'title', 'image'].join(',')

    let products = await shopifyApi.product.list({
        ids: productIds,
        fields: productFields,
    })

    products = products.map(product => ({...product, image: product.image.src}))

    productViews = productViews.map(view => ({
        ...view,
        customer: customers.find(customer => customer.id == view.customerId),
        product: products.find(product => product.id == view.productId),
    }))

    collectionViews = collectionViews.map(view => ({
        ...view,
        customer: customers.find(customer => customer.id == view.customerId),
    }))

    return res.json({
        productViews,
        collectionViews,
    })

})

module.exports = router