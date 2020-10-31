const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .catch(console.log);

mongoose.connection.once("open", () =>
  console.log("MongoDB database connection established succesfully")
);
