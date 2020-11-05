const router = require('express').Router()
const { Event } = require('../models')

router.get('/', async (req, res) => {

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

    return res.json({
        productViews,
        collectionViews,
    })

})

module.exports = router