const router = require('express').Router()
const Shop = require('../models/shop')

router.get('/:identifier', async (req, res) => {

    const shop = await Shop.findOne({
        $or: [
            { _id: req.params.identifier },
            { hostname: req.params.identifier },
        ]
    })

    return res.json({ shop })

})

module.exports = router