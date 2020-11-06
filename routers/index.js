const router = require('express').Router()

// router.use('/', require('../middlewares/get-client-info'))

router.use('/chat', require('./chat'))
router.use('/shopify', require('./shopify'))
router.use('/reports', require('./report'))
router.use('/slack', require('./slack'))

module.exports = router