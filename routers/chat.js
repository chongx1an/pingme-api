const router = require('express').Router()
const { WebClient } = require('@slack/web-api')
const Slack = new WebClient(process.env.SLACK_TOKEN)

router.post('/', async (req, res) => {

	const params = req.requirePermit(['text'], ['threadTs'])
  
	const channel = "#cx"

	if(params.threadTs) {

		const message = await Slack.chat.postMessage({
			channel,
			text: params.text,
			thread_ts: params.threadTs,
		})

		return res.json({ threadTs: params.threadTs, ts: message.ts })

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
							text: `*Name:* ${name}`
						},
						{
							type: "mrkdwn",
							text: `*Email:* ${email}`
						},
					]
				},
				{
					type: "section",
					fields: [
						{
							type: "mrkdwn",
							text: `*OS:* ${req.useragent.os}`
						},
						{
							type: "mrkdwn",
							text: `*Browser:* ${req.useragent.browser}`
						},
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
		text: params.text,
	})
  
	return res.json({ threadTs: main.ts })
  
})

router.get('/replies', async (req, res) => {

	const params = req.requirePermit(['threadTs'])

	const response = await Slack.conversations.replies({
		channel: 'C019V3EM0H3',
		ts: params.threadTs,
	})

	return res.json({ messages: response.messages })

})

router.post('/contact', async (req, res) => {

	const params = req.requirePermit(['threadTs'], ['name', 'email'])

	const { name, email } = params

	const { city, country } = req.geo
  
	const channel = "C019V3EM0H3"
  
	await Slack.chat.update({
		text:  `${name} - ${city}, ${country}`,
		channel,
		ts: params.threadTs,
	})

	const response = await Slack.conversations.replies({
		channel: 'C019V3EM0H3',
		ts: params.threadTs,
	})

	const infoMessage = response.messages[1]

	const attachments = [
		{
			color: "#35373B",
			blocks: [
				{
					type: "section",
					fields: [
						{
							type: "mrkdwn",
							text: `*Name:* ${name}`
						},
						{
							type: "mrkdwn",
							text: `*Email:* ${email}`
						}
					]
				},
				{
					type: "section",
					fields: [
						{
							type: "mrkdwn",
							text: `*OS:* ${req.useragent.os}`
						},
						{
							type: "mrkdwn",
							text: `*Browser:* ${req.useragent.browser}`
						},
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
  
	await Slack.chat.update({
		channel,
		ts: infoMessage.ts,
		attachments,
	})

	// const thanksMessage = await Slack.chat.postMessage({
	// 	channel,
	// 	text: 'Thanks for contact',
	// 	thread_ts: params.ts,
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