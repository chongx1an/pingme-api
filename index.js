const express = require('express')
const router  = require('./routers')
require('dotenv').config()

const app  = express()
const port = process.env.APP_PORT || 3000

// app.use(
//   express.urlencoded({
//     extended: true
//   })
// )

app.use(express.json())

app.use('/', router)

app.listen(port, () => console.log('Server is listening on port ' + port))