const router = require('express').Router()
const Shopify = require('shopify-api-node')
const { Event, CustomerProduct } = require('../models')
const Store = require('../models/store')
const moment = require('moment')

router.get('/', async (_, res) => {

    const shop = 'posta-show-case.myshopify.com'

    const store = await Store.findOne({ shop })

    const date = new Date()
    date.setDate(date.getDate() - 3)

    let records = await CustomerProduct.find({
        $or: [
            {
                'view.count': { $gte: 2 },
            },
            {
                'search.count': { $gte: 2 },
            },
            {
                addedToCartAt: { $lte: date },
            },
            {
                checkoutAt: { $lte: date },
            },
        ]
    })


    const shopifyApi = new Shopify({
        shopName: store.shop,
        accessToken: store.accessToken
    })


    // List customers
    const customerIds = records.map(record => record.customerId).join(',')
    const customerFields = ['id', 'first_name', 'last_name', 'email', 'phone', 'orders_count'].join(',')

    const customers = await shopifyApi.customer.list({
        ids: customerIds,
        fields: customerFields,
    })


    // List products
    const productIds = records.map(record => record.productId).join(',')
    const productFields = ['id', 'title', 'image'].join(',')

    let products = await shopifyApi.product.list({
        ids: productIds,
        fields: productFields,
    })

    products = products.map(product => ({
        ...product,
        image: product.image.src
    }))

    records = records.map(record => {

        record = record.toJSON()

        record.customer = customers.find(customer => customer.id == record.customerId)
        record.product = products.find(product => product.id == record.productId)

        record.addToCart = record.addedToCartAt ? {
            at: record.addedToCartAt,
            ago: moment(record.addedToCartAt).fromNow(),
        } : null

        delete record.addedToCartAt

        record.checkout = record.checkoutAt ? {
            at: record.checkoutAt,
            ago: moment(record.checkoutAt).fromNow(),
        } : null

        delete record.checkoutAt
        
        if(record.view.count > 1) {
            record.view.maxInterval = moment(record.view.at[record.view.at.length - 1]).from(record.view.at[0])
        }

        if(record.search.count > 1) {
            record.search.maxInterval = moment(record.search.at[record.search.at.length - 1]).from(record.search.at[0])
        }

        return record

    })

    return res.json({ results: records })

})

router.get('/', async (req, res) => {

    const shop = 'posta-show-case.myshopify.com'

    const store = await Store.findOne({ shop })

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


    // List customers
    const customerIds = [...productViews.map(view => view.customerId), ...collectionViews.map(view => view.customerId)].join(',')
    const customerFields = ['id', 'first_name', 'last_name', 'email', 'phone', 'orders_count'].join(',')

    const customers = await shopifyApi.customer.list({
        ids: customerIds,
        fields: customerFields,
    })


    // List products
    const productIds = productViews.map(view => view.productId).join(',')
    const productFields = ['id', 'title', 'image'].join(',')

    let products = await shopifyApi.product.list({
        ids: productIds,
        fields: productFields,
    })

    products = products.map(product => ({
        ...product,
        image: product.image.src
    }))

    productViews = productViews.map(view => ({
        ...view,
        customer: customers.find(customer => customer.id == view.customerId),
        product: products.find(product => product.id == view.productId),
    }))


    // List collections
    const collectionIds = collectionViews.map(view => view.collectionId)

    let collections = await Promise.all(collectionIds.map(id => shopifyApi.collection.get(id, { fields: 'title,image' })))

    collections = collections.map(collection => ({
        ...collection,
        image: collection.image ? collection.image.src : null,
    }))

    collectionViews = collectionViews.map(view => ({
        ...view,
        customer: customers.find(customer => customer.id == view.customerId),
        collection: collections.find(collection => collection.id == view.collectionId)
    }))

    // Return result
    return res.json({
        productViews,
        collectionViews,
    })

})

module.exports = router