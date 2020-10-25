require('dotenv').config()
const express = require('express')
const cors = require('cors')
const router  = require('./routers')

const app  = express()

app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(express.json())
app.use(cors())

app.use('/', router)

const port = process.env.PORT || 3000

const server = require('http').createServer(app)
const io = require('socket.io')(server)
require('./events')(io)

server.listen(port, () => console.log('Server is listening on port ' + port))