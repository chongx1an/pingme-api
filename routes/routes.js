const router = require('express').Router();

const chat = require('../controllers/chat.controller')

router.route('/chat/first').post(chat.first_touch)
router.route('/chat/contact').post(chat.give_contact)
router.route('/chat/event').post(chat.handle_event)

module.exports = router
