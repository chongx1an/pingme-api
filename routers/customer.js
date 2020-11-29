const router = require('express').Router()
const ProductView = require('../models/product-view')
const Shopify = require('shopify-api-node')
const Store = require('../models/store')
const moment = require('moment')

router.get('/', async (req, res) => {

    const params = req.requirePermit(['productId'])

    const productId = params.productId

    const shop = 'posta-show-case.myshopify.com'

    const store = await Store.findOne({ shop })

    let views = await ProductView.find({ productId, shop })

    const shopifyApi = new Shopify({
        shopName: store.shop,
        accessToken: store.accessToken
    })

    let customerIds = []
    
    views.forEach(view => customerIds.push(view.customerId))

    customerIds = customerIds.join(',')
    const customerFields = ['id', 'first_name', 'last_name', 'email', 'phone', 'orders_count'].join(',')

    const customers = await shopifyApi.customer.list({
        ids: customerIds,
        fields: customerFields,
    })

    views = views.map(view => {
        
        view = view.toJSON()

        view.customer = customers.find(customer => customer.id == view.customerId)
        view.interval = moment(view.history[view.history.length - 1]).from(view.history[0])

        return view

    })

    return res.json({ results: views })

})

module.exports = router