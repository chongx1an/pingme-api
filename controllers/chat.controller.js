require('dotenv').config();

const { WebClient } = require('@slack/web-api')
const RequestIp     = require('@supercharge/request-ip')

const token     = process.env.SLACK_TOKEN
const slack_web = new WebClient(token)

exports.first_touch = async (req, res) => {

  text    = req.body.text

  city    = req.geo.city
  country = req.geo.country

  channel = "#cx"

  envelope = {
		username: "KK",
    text:  `${city}, ${country}`,
    channel: channel
  }

  main = await slack_web.chat.postMessage(envelope)

  thread_ts = main.ts

  name = "NA"
  email = "NA"

  attachments = [
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
    channel: channel,
    thread_ts: thread_ts,
    attachments: attachments
  }

  contact = await slack_web.chat.postMessage(envelope)

  envelope = {
    channel: channel,
    thread_ts: thread_ts,
    text: text
  }

  first = await slack_web.chat.postMessage(envelope)

  res.send({
    main: main,
    contact: contact,
    first: first
  })

}

exports.give_contact = async (req, res) => {

  name    = req.body.name
  email   = req.body.email
  city    = req.geo.city
  country = req.geo.country

  channel = "C019V3EM0H3"

  envelope = {
    text:  `${name} - ${city}, ${country}`,
    channel: channel,
    ts: "1603545320.012900"
  }

  result = await slack_web.chat.update(envelope)

  attachments = [
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
    channel: channel,
    ts: "1603545321.013000",
    attachments: attachments
  }

  result = await slack_web.chat.update(envelope)

  res.send("OK")

}

exports.handle_event = async (req, res) => {

  channel = "#general"

  envelope = {
    text:  JSON.stringify(req.body),
    channel: channel
  }

  main = await slack_web.chat.postMessage(envelope)

  res.send(req.body.challenge)

}