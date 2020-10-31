const router = require('express').Router()
const { WebClient } = require('@slack/web-api')
const { slack: slackConfig } = require('../../config')
const Team = require('../../models/team')

router.post('/', async (req, res) => {

    const params = req.requirePermit(['code'])

    const result = await (new WebClient()).oauth.v2.access({
        client_id: slackConfig.clientId,
        client_secret: slackConfig.clientSecret,
        code: params.code
    })

    if (!result.team.id) return res.error(result)

    if(await Team.exists({ id: result.team.id })) {
        return res.error('team_already_exists')
    }

    await Team.create({
        id: result.team.id,
        name: result.team.name,
        userId: result.authed_user.id,
        mainChannelId: result.incoming_webhook.channel_id,
        bot: {
            userId: result.bot_user_id,
            accessToken: result.access_token,
        },
        incomingWebhookUrl: result.incoming_webhook.url

    }).catch(console.error)

    return res.success()

})

module.exports = router