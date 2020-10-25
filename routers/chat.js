const router = require('express').Router()
const { WebClient } = require('@slack/web-api')
const SlackWeb = new WebClient(process.env.SLACK_TOKEN)

router.post('/first', async (req, res) => {

	return res.json({
		ip: req.ip,
		geo: req.geo,
	})

	let text = req.body.text

	const { city, country } = req.geo
  
	const channel = "#cx"
  
	let envelope = {
		username: "KK",
		text:  `${city}, ${country}`,
		channel
	}
  
	const main = await SlackWeb.chat.postMessage(envelope)
	
	const name = 'NA'
	const email = 'NA'
  
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
  
	const contact = await SlackWeb.chat.postMessage(envelope)
  
	envelope = {
	  channel,
	  thread_ts: main.ts,
	  text,
	}
  
	const first = await SlackWeb.chat.postMessage(envelope)
  
	return res.json({
	  main,
	  contact,
	  first,
	})
  
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
  
	await SlackWeb.chat.update(envelope)
  
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
  
	await SlackWeb.chat.update(envelope)
  
	return res.send("OK")
  
})

router.post('/event', async (req, res) => {

	const channel = "#general"
  
	const envelope = {
	  text:  JSON.stringify(req.body),
	  channel
	}
  
	await SlackWeb.chat.postMessage(envelope)
  
	return res.send(req.body.challenge)
  
})

module.exports = router