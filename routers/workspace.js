const router = require('express').Router()
const { WebClient } = require('@slack/web-api')
const Slack = new WebClient(process.env.SLACK_TOKEN)

let Workspace = require('../models/workspace')

router.post('/', async (req, res) => {

  if (!req.body.code) return res.status(400).send('Code is missing')

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;

  const result = await (new WebClient()).oauth.v2.access({
    client_id: clientId,
    client_secret: clientSecret,
    code: req.body.code
  });

  const Slack = new WebClient(process.env.SLACK_TOKEN)

  const message = await Slack.chat.postMessage({
    channel: "#cx",
    text: JSON.stringify(result)
  })

  // let workspace = new Workspace(req.body)

  // workspace.save()
  //   .then(doc => {

  //     if (!doc || doc.length === 0) return res.status(500).send(doc)

  //     res.status(201).send(doc)

  //   })
  //   .catch(err => {

  //     res.status(500).json(err)

  //   })

})

module.exports = router