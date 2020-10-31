const router = require('express').Router()

router.use('/', require('../middlewares/get-client-info'))

router.use('/auth', require('./auth'))
router.use('/chat', require('./chat'))
router.use('/teams', require('./team'))

module.exports = router