const mongoose = require("mongoose");

const connectDB = async () => {
  console.log(process.env.MONGO_URI);
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(process.env.MONGO_URI);
  // const conn = await mongoose.connect(process.env.MONGO_URI, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // });

  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
