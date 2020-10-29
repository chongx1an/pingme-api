const router = require('express').Router()
const { WebClient } = require('@slack/web-api')
const Slack = new WebClient(process.env.SLACK_TOKEN)

router.post('/', async (req, res) => {

	let text = req.body.text
  
	const channel = "#cx"

	if(req.body.threadTs) {

		const message = await Slack.chat.postMessage({
			channel,
			text,
			thread_ts: req.body.threadTs,
		})

		return res.json({ threadTs: req.body.threadTs, ts: message.ts })

	}

	const { city, country } = req.geo
  
	const main = await Slack.chat.postMessage({
		username: "Chat",
		text:  `${city}, ${country}`,
		channel
	})
	
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
				},
				{
					type: "section",
					fields: [
						{
							type: "mrkdwn",
							text: `*OS:*\n ${req.useragent.os}`
						},
						{
							type: "mrkdwn",
							text: `*Browser:*\n ${req.useragent.browser}`
						},
						{
							type: "mrkdwn",
							text: `*GeoIP:*\n ${req.useragent.geoIp}`
						}
					]
				},
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
  
	const contact = await Slack.chat.postMessage({
		channel,
		thread_ts: main.ts,
		attachments
	})
  
	const first = await Slack.chat.postMessage({
		channel,
		thread_ts: main.ts,
		text,
	})
  
	return res.json({ threadTs: main.ts })
  
})

router.get('/replies', async (req, res) => {

	const response = await Slack.conversations.replies({
		channel: 'C019V3EM0H3',
		ts: req.query.threadTs,
	}).catch(e => console.log(e))

	return res.json({ messages: response.messages })

})

router.post('/contact', async (req, res) => {

	const { name, email } = req.body

	const { city, country } = req.geo
  
	const channel = "C019V3EM0H3"
  
	let envelope = {
	  text:  `${name} - ${city}, ${country}`,
	  channel,
	  ts: req.body.threadTs,
	}
  
	await Slack.chat.update(envelope)

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
  
	await Slack.chat.update({
		channel,
		ts: "1603545321.013000",
		attachments
	})

	// const thanksMessage = await Slack.chat.postMessage({
	// 	channel,
	// 	text: 'Thanks for contact',
	// 	thread_ts: req.body.ts,
	// })
  
	return res.json({ success: true })
  
})

router.post('/event', async (req, res) => {
  
	// await Slack.chat.postMessage({
	// 	text:  JSON.stringify(req.body),
	//  	channel: '#general'
	// })

	const event = req.body.event

	console.log(event)

	if(event.type == 'message' && !event.bot_id) {
		console.log(`Emitting ${event.thread_ts}.receiveMessage event`)
		global.io.emit(`${event.thread_ts}.receiveMessage`, event)
	}
  
	return res.send(req.body.challenge)
  
})

module.exports = router