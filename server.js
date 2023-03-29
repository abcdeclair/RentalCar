const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const cors = require("cors");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
connectDB();

const app = express();

app.use(cors());

//add body parser
app.use(express.json());

//Cookie parser
app.unsubscribe(cookieParser());

const RentalCarProvider = require("./routes/RentalCarProvider");
const auth = require("./routes/auth");
const appointments = require("./routes/appointments");

app.use("/api/v1/RentalCarProvider", RentalCarProvider);
app.use("/api/v1/auth", auth);
app.use("/api/v1/appointments", appointments);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT
  )
);

//Handle unhandled promise rejections
process.on("unhandleRejection", (err, promise) => {
  console.log(`Error: ${err.messsage}`);
  //Close server & exit process
  server.close(() => process.exit(1));
});
