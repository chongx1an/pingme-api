const express = require('express')
const router  = require('./routes/routes')
const RequestIp = require('@supercharge/request-ip')
const geoip = require('geoip-lite');

const app  = express()
const port = process.env.APP_PORT || 3000

app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(express.json())

const getClientInfo = function (req, res, next) {  

  // ip = RequestIp.getClientIp(req)
  ip = '60.52.31.157'

  geo = geoip.lookup(ip)

  req.ip = ip
  req.geo = geo

  next()

}

app.use(getClientInfo)

app.use('/', router)

app.listen(port)