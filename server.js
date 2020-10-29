require('dotenv').config()
const express = require('express')
const cors = require('cors')
const useragent = require('express-useragent')
const router  = require('./routers')

const app  = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(useragent.express())

app.use('/', router)

const server = require('http').createServer(app)
global.io = require('socket.io').listen(server)

global.io.on('connection', () => console.log('Socket connected'))

const port = process.env.PORT || 3000

server.listen(port, () => console.log('Server is listening on port ' + port))