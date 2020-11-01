const router = require('express').Router()
const { WebClient } = require('@slack/web-api')
const Shopify = require('shopify-api-node')
const { slack: slackConfig } = require('../config')
const { Team, Store } = require('../models')

router.post('/auth', async (req, res) => {

    const params = req.requirePermit(['code'], ['storeId'])

    const result = await (new WebClient()).oauth.v2.access({
        client_id: slackConfig.clientId,
        client_secret: slackConfig.clientSecret,
        code: params.code
    })

    if (!result.team.id) return res.error(result)

    if(await Team.exists({ id: result.team.id })) {
        return res.error('team_already_exists')
    }

    const team = await Team.create({
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

    if(params.storeId) {

        const store = await Store.findByIdAndUpdate(params.storeId, { teamId: team._id })

        const shopify = new Shopify({
            shopName: store.hostName,
            accessToken: store.accessToken
        })

        let response = await shopify.scriptTag.create({
            event: 'onload',
            src: 'https://minimo-chatbox.surge.sh/script.js',
        })

        console.log(response)

        response = await shopify.webhook.create({
            topic: 'app/uninstalled',
            address: 'https://the-pingme-api.herokuapp.com/shopify/webhooks/app/uninstalled',
            format: 'json',
        })

        console.log(response)
            
    }

    return res.success()

})

module.exports = router