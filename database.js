const mongoose = require("mongoose")
const { dbPath } = require('./config')

mongoose
  .connect(dbPath, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .catch(console.log)

mongoose.connection.once("open", () =>
  console.log("MongoDB database connection established succesfully")
)