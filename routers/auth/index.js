const router = require('express').Router()

router.use('/shopify', require('./shopify'))

module.exports = router