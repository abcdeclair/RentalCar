const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  apptDate: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  rentalCarProvider: {
    type: mongoose.Schema.ObjectId,
    ref: "RentalCarProvider",
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
