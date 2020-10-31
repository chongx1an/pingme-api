const { WebClient } = require('@slack/web-api')
const Slack = new WebClient(process.env.SLACK_TOKEN)

process.on('uncaughtException', function (err) {
    Slack.chat.postMessage({
        channel: '#errors',
        text: JSON.stringify(err.stack)
    })
})

process.on('unhandledRejection', function(reason, p){
    Slack.chat.postMessage({
        channel: '#errors',

        text: JSON.stringify(reason)
    })
})