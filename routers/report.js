const router = require('express').Router()
const Shopify = require('shopify-api-node')
const { ProductView } = require('../models')
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
        matcher.productId = {
            $in: params.productIds,
            shop: store.shop,
        }
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
        image: product.image && product.image.src
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

module.exports = router