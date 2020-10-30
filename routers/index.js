const router = require('express').Router()

router.use('/', require('../middlewares/get-client-info'))

router.use('/chat', require('./chat'))
router.use('/workspace', require('./workspace'))

module.exports = router