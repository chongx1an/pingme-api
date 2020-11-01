const router = require('express').Router()

router.use('/', require('../middlewares/get-client-info'))

router.use('/auth', require('./auth'))
router.use('/chat', require('./chat'))
router.use('/teams', require('./team'))
router.use('/shopify', require('./shopify'))
router.use('./slack', require('./slack'))
router.use('/stores', require('./store'))

module.exports = router