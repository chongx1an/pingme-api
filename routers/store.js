const router = require('express').Router()
const Store = require('../models/store')
const { Types } = require('mongoose')

router.get('/:identifier', async (req, res) => {

    const store = Types.ObjectId.isValid(req.params.identifier)
    ? await Store.findById(req.params.identifier)
    : await Store.findOne({ hostName: req.params.identifier })

    return res.json({ store })

})

module.exports = router