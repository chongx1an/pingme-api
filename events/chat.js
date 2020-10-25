const { WebClient } = require('@slack/web-api')
const Slack = new WebClient(process.env.SLACK_TOKEN)
const GeoIp = require('geoip-lite')

module.exports = (io, socket) => {

    socket.on('sendMessage', async data => {

        let envelope
      
        let text = data.text

        const ip = socket.request.connection.remoteAddress

        console.log(`Message received from ${ip}: ${data.text}`)

        const geo = GeoIp.lookup(ip) || { city: '', country: '' }

        const { city, country } = geo
    
        const channel = "#cx"

        if(socket.ts) {

            envelope = {
                channel,
                thread_ts: socket.ts,
                text,
            }

            await Slack.chat.postMessage(envelope)

            return

        }
    
        envelope = {
            username: "Chat",
            text:  `${city}, ${country}`,
            channel
        }
    
        const main = await Slack.chat.postMessage(envelope)

        socket.ts = main.ts
        
        const name = 'N/A'
        const email = 'N/A'
    
        const attachments = [
            {
                color: "#35373B",
                blocks: [
                    {
                        type: "section",
                        fields: [
                            {
                                type: "mrkdwn",
                                text: `*Name:*\n ${name}`
                            },
                            {
                                type: "mrkdwn",
                                text: `*Email:*\n ${email}`
                            }
                        ]
                    }
                ]
            },
            {
                color: "#3AA3E3",
                blocks: [
                    {
                        type: "actions",
                        elements: [
                            {
                                type: "button",
                                text: {
                                    type: "plain_text",
                                    text: "Mute",
                                    emoji: true
                                },
                                value: "message_id",
                                action_id: "mute"
                            },
                            {
                                type: "button",
                                text: {
                                    type: "plain_text",
                                    text: "Ban IP",
                                    emoji: true
                                },
                                style: "danger",
                                value: "message_id",
                                action_id: "ban-ip"
                            }
                        ]
                    }
                ]
            }
        ]
        
        envelope = {
            channel,
            thread_ts: main.ts,
            attachments
        }
    
        const contact = await Slack.chat.postMessage(envelope)
    
        envelope = {
            channel,
            thread_ts: main.ts,
            text,
        }
    
        const first = await Slack.chat.postMessage(envelope)
      
    })

    socket.on('receiveMessage', async data => {

    })
  
    socket.on('formSubmitted', async data => {
  


    })

}