const router = require('express').Router()
const { Event } = require('../models')

router.get('/report', async (req, res) => {

    const customerViewProducts = await Event.aggregate([
        {
            $match: {
                topic: 'view_product',
            }
        },
        {
            $group: {
                _id: '$customerId',
                viewProductCount: { $sum: 1 },
            },
        },
        {
            $match: {
                viewProductCount: { $gte: 2 },
            },
        }
    ])

    const customerViewCollection = await Event.aggregate([
        {
            $match: {
                topic: 'view_collection',
            }
        },
        {
            $group: {
                _id: '$customerId',
                viewCollectionCount: { $sum: 1 },
            },
        },
        {
            $match: {
                viewCollectionCount: { $gte: 2 },
            },
        }
    ])

    return res.json({
        customerViewProducts,
        customerViewCollection,
    })

})

module.exports = router