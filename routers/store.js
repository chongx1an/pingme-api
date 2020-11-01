const router = require('express').Router()
const Store = require('../models/store')
const { Types } = require('mongoose')

router.get('/:identifier', async (req, res) => {

    const isId = Types.ObjectId.isValid(req.params.identifier)

    let store

    if(isId) {
        store = await Store.findById(req.params.identifier)
    } else {
        store = await Store.findOne({ hostname: req.params.identifier })
    }

    return res.json({ store })

})

module.exports = router