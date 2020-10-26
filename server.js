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

app.listen(port, () => console.log('Server is listening on port ' + port))