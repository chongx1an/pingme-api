const { WebClient } = require('@slack/web-api')
const Slack = new WebClient(process.env.SLACK_TOKEN)

process.on('uncaughtException', async function (err) {

    let errStack = err.stack.split('\n')
    const firstLine = errStack.shift()

    errStack = [`*${firstLine}*\n`, ...errStack].join('\n')

    const blocks = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: 'API',
            }
        },
        {
			type: 'divider'
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: errStack,
            }
        }
    ]

    await Slack.chat.postMessage({
        channel: '#errors',
        blocks,
    })

})

process.on('unhandledRejection', async function(reason, promise) {

    const blocks = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: JSON.stringify({ promise, reason }),
            },
        }
    ]

    await Slack.chat.postMessage({
        channel: '#errors',
        blocks,
    })

})