const router = require('express').Router()
const { WebClient } = require('@slack/web-api')
const Slack = new WebClient(process.env.SLACK_TOKEN)

router.post('/first', async (req, res) => {

	let text = req.body.text

	const { city, country } = req.geo
  
	const channel = "#cx"
  
	let envelope = {
		username: "Chat",
		text:  `${city}, ${country}`,
		channel
	}
  
	const main = await Slack.chat.postMessage(envelope)
	
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
  
	return res.json({
	  main,
	  contact,
	  first,
	})
  
})

router.post('/subsequent', async (req, res) => {

	const envelope = {
		channel: '#cx',
		thread_ts: req.body.ts,
		text: req.body.text,
	}

	const message = await Slack.chat.postMessage(envelope)

	return res.json({ message })

})

router.post('/contact', async (req, res) => {

	const { name, email } = req.body

	const { city, country } = req.geo
  
	const channel = "C019V3EM0H3"
  
	let envelope = {
	  text:  `${name} - ${city}, ${country}`,
	  channel,
	  ts: "1603545320.012900"
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
	
	envelope = {
	  channel,
	  ts: "1603545321.013000",
	  attachments
	}
  
	await Slack.chat.update(envelope)
  
	return res.send("OK")
  
})

router.post('/event', async (req, res) => {

	const channel = "#general"
  
	const envelope = {
	  text:  JSON.stringify(req.body),
	  channel
	}
  
	await Slack.chat.postMessage(envelope)
  
	return res.send(req.body.challenge)
  
})

module.exports = router