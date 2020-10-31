const router = require('express').Router()
const Shop = require('../models/shop')
const { Types } = require('mongoose')

router.get('/:identifier', async (req, res) => {

    const isId = Types.ObjectId.isValid(req.params.identifier)

    let shop

    if(isId) {
        shop = await Shop.findById(req.params.identifier)
    } else {
        shop = await Shop.findOne({ hostname: req.params.identifier })
    }

    return res.json({ shop })

})

module.exports = router