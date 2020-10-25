const router = require('express').Router()

router.use('/', require('../middlewares/get-client-info'))

router.use('/chat', require('./chat'))

module.exports = router