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

    const productIds = views.map(view => view.productId).join(',')
    const productFields = ['id', 'title', 'image'].join(',')

    let products = (await shopifyApi.product.list({
        ids: productIds,
        fields: productFields,
    }))

    const emptyImage = "data:image/jpeg;base64,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"
    
    products = products.map(product => ({
        ...product,
        image: product.image ? product.image.src : emptyImage 
    }))

    views = views.map(view => {

        view.product = products.find(product => product.id == view._id)

        view.totalViews = view.data.map(datum => datum.count).reduce((acc, val) => acc + val)

        view.customersCount = view.data.length

        let histories = []

        view.data.forEach(datum => histories = histories.concat(datum.history))

        histories = histories.sort()

        view.lastViewed = histories[histories.length - 1]

        view.interval = moment(histories[histories.length - 1]).from(histories[0])

        view.customerIds = customerIds
        
        delete view.data

        return view

    })

    return res.json({ results: views })

})

module.exports = router