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

    console.log(reason)

    let array = []

    Object.keys(reason).forEach(key => {
        if(typeof reason[key] == 'string') {
            array.push(reason[key])
        }
    })

    const text = array.reduce((a, b) => a.length > b.length ? a : b)

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
                text,
            },
        }
    ]

    await Slack.chat.postMessage({
        channel: '#errors',
        blocks,
    })

})