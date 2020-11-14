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
        image: product.image.src
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

// router.get('/', async (req, res) => {

//     const shop = 'posta-show-case.myshopify.com'

//     const store = await Store.findOne({ shop })

//     let productViews = await Event.aggregate([
//         {
//             $match: {
//                 topic: 'view_product',
//             }
//         },
//         {
//             $group: {
//                 _id: { customerId: '$customerId', productId: '$payload.productId' },
//                 views: { $sum: 1 },
//             },
//         },
//         {
//             $match: {
//                 views: { $gte: 2 },
//             },
//         },
//         {
//             $project: {
//                 _id: 0,
//                 customerId: '$_id.customerId',
//                 productId: '$_id.productId',
//                 views: 1
//             }
//         }
//     ])

//     let collectionViews = await Event.aggregate([
//         {
//             $match: {
//                 topic: 'view_collection',
//             }
//         },
//         {
//             $group: {
//                 _id: { customerId: '$customerId', collectionId: '$payload.collectionId' },
//                 views: { $sum: 1 },
//             },
//         },
//         {
//             $match: {
//                 views: { $gte: 2 },
//             },
//         },
//         {
//             $project: {
//                 _id: 0,
//                 customerId: '$_id.customerId',
//                 collectionId: '$_id.collectionId',
//                 views: 1
//             }
//         }
//     ])

//     const shopifyApi = new Shopify({
//         shopName: store.shop,
//         accessToken: store.accessToken
//     })


//     // List customers
//     const customerIds = [...productViews.map(view => view.customerId), ...collectionViews.map(view => view.customerId)].join(',')
//     const customerFields = ['id', 'first_name', 'last_name', 'email', 'phone', 'orders_count'].join(',')

//     const customers = await shopifyApi.customer.list({
//         ids: customerIds,
//         fields: customerFields,
//     })


//     // List products
//     const productIds = productViews.map(view => view.productId).join(',')
//     const productFields = ['id', 'title', 'image'].join(',')

//     let products = await shopifyApi.product.list({
//         ids: productIds,
//         fields: productFields,
//     })

//     products = products.map(product => ({
//         ...product,
//         image: product.image.src
//     }))

//     productViews = productViews.map(view => ({
//         ...view,
//         customer: customers.find(customer => customer.id == view.customerId),
//         product: products.find(product => product.id == view.productId),
//     }))


//     // List collections
//     const collectionIds = collectionViews.map(view => view.collectionId)

//     let collections = await Promise.all(collectionIds.map(id => shopifyApi.collection.get(id, { fields: 'title,image' })))

//     collections = collections.map(collection => ({
//         ...collection,
//         image: collection.image ? collection.image.src : null,
//     }))

//     collectionViews = collectionViews.map(view => ({
//         ...view,
//         customer: customers.find(customer => customer.id == view.customerId),
//         collection: collections.find(collection => collection.id == view.collectionId)
//     }))

//     // Return result
//     return res.json({
//         productViews,
//         collectionViews,
//     })

// })

module.exports = router