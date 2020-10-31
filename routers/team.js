const router = require('express').Router()
const Team = require('../models/team')

router.get('/:teamId', async (req, res) => {

    const team = await Team.findById(req.params.teamId)

    if(!team) return res.error('team_not_found', 404)

    return res.json({ team })

})

module.exports = router