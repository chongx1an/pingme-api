require('dotenv').config()
const express = require('express')
const cors = require('cors')
const useragent = require('express-useragent')
const mongoose = require('mongoose');
const router  = require('./routers')
// require('./database')

const app  = express()
require('./ext/app')(app)

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

const database_path = process.env.DB_PATH

mongoose.set('useCreateIndex', true)
mongoose.connect(database_path, {useNewUrlParser: true, useUnifiedTopology: true})

var db = mongoose.connection;

if(!db)
  console.log("Error connecting db")
else
  console.log("Db connected successfully")