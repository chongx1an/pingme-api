const router = require('express').Router()
const Shopify = require('shopify-api-node')
const { Event, CustomerProduct, ProductView } = require('../models')
const Store = require('../models/store')
const moment = require('moment')

router.get('/', async (req, res) => {

    const params = req.requirePermit([], ['productIds'])

    const shop = 'posta-show-case.myshopify.com'

    const store = await Store.findOne({ shop })

    let matcher = {
        count: { $gte: 2 },
    }

    if(params.productIds) {
        matcher.productId = { $in: params.productIds }
    }

    let views = await ProductView.aggregate([
        {
            $match: matcher,
        },
        {
            $group: {
                _id: '$productId',
                data: { $push: '$$ROOT' },
            }
        },
    ])

    const shopifyApi = new Shopify({
        shopName: store.shop,
        accessToken: store.accessToken
    })

    let customerIds = []
    
    views.forEach(view => {
        view.data.forEach(datum => {
            if(!customerIds.includes(datum.customerId)) {
                customerIds.push(datum.customerId)
            }
        })
    })

    customerIds = customerIds.join(',')
    const customerFields = ['id', 'first_name', 'last_name', 'email', 'phone', 'orders_count'].join(',')

    const customers = await shopifyApi.customer.list({
        ids: customerIds,
        fields: customerFields,
    })

    const productIds = views.map(view => view.productId).join(',')
    const productFields = ['id', 'title', 'image'].join(',')

    let products = (await shopifyApi.product.list({
        ids: productIds,
        fields: productFields,
    }))

    products = products.map(product => ({
        ...product,
        image: product.image.src || "data:image/jpeg;base64,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"
    }))

    views = views.map(view => {

        view.product = products.find(product => product.id == view._id)

        view.customers = view.data
        .map(datum => ({
            ...datum,
            ...customers.find(customer => customer.id == datum.customerId)
        }))
        .map(customer => ({
            ...customer,
            interval: moment(customer.history[customer.history.length - 1]).from(customer.history[0]),
        }))

        delete view.data

        return view

    })

    return res.json({ results: views })

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