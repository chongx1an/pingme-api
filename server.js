require('dotenv').config()
require('./ext')
require('./utils/error-handler')
const express = require('express')
const cors = require('cors')
const useragent = require('express-useragent')
const router  = require('./routers')
require('./database')

const app  = express()
require('./ext/app')(app)

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(useragent.express())

app.use('/', router)

const server = require('http').createServer(app)
global.io = require('socket.io').listen(server)

global.io.on('connection', () => console.log('Socket connected'))

const port = process.env.PORT || 3000

server.listen(port, () => console.log('Server is listening on port ' + port))