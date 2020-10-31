const router = require('express').Router()

router.use('/shopify', require('./shopify'))
router.use('/slack', require('./slack'))

module.exports = router