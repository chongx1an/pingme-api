const router = require('express').Router()
const Shopify = require('shopify-api-node')
const { Event } = require('../models')
const Store = require('../models/store')

router.get('/', async (req, res) => {

    const store = await Store.findOne()

    const productViews = await Event.aggregate([
        {
            $match: {
                topic: 'view_product',
            }
        },
        {
            $group: {
                _id: { customerId: '$customerId', productId: '$payload.productId' },
                viewProductCount: { $sum: 1 },
            },
        },
        {
            $match: {
                viewProductCount: { $gte: 2 },
            },
        },
        {
            $project: {
                _id: 0,
                customerId: '$_id.customerId',
                productId: '$_id.productId',
                viewProductCount: 1
            }
        }
    ])

    const collectionViews = await Event.aggregate([
        {
            $match: {
                topic: 'view_collection',
            }
        },
        {
            $group: {
                _id: { customerId: '$customerId', collectionId: '$payload.collectionId' },
                viewCollectionCount: { $sum: 1 },
            },
        },
        {
            $match: {
                viewCollectionCount: { $gte: 2 },
            },
        },
        {
            $project: {
                _id: 0,
                customerId: '$_id.customerId',
                collectionId: '$_id.collectionId',
                viewCollectionCount: 1
            }
        }
    ])

    const customerIds = [...productViews.map(view => view.customerId), ...collectionViews.map(view => view.customerId)]

    console.log(store)

    const shopifyApi = new Shopify({
        shopName: store.shop,
        accessToken: store.accessToken
    })

    const customers = await shopifyApi.customer.list({
        ids: customerIds.join(','),
    })

    productViews = productViews.map(view => ({
        ...view,
        customer: customers.find(customer => customer.id == view.customerId)
    }))

    collectionViews = collectionViews.map(view => ({
        ...view,
        customer: customers.find(customer => customer.id == view.customerId)
    }))

    return res.json({
        productViews,
        collectionViews,
    })

})

module.exports = router