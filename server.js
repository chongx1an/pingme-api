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
app.use(cors({ credentials: true }))

app.use('/', router)

const server = require('https').createServer(app)
const io = require('socket.io')(server)

io.on('connection', () => console.log('Socket connected'))

app.use('/', (req, _, next) => {
  req.io = io
  next()
})

const port = process.env.PORT || 3000

app.listen(port, () => console.log('Server is listening on port ' + port))