require('dotenv').config()
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const router  = require('./routers')

const app  = express()

app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(express.json())
app.use(cors())

app.set('trust proxy', 1)
app.use(session({
  secret: 'secret',
  resave: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 365 * 1000
  },
  saveUninitialized: true
}))

app.use('/', router)

const port = process.env.PORT || 3000

app.listen(port, () => console.log('Server is listening on port ' + port))