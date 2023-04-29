const mongoose = require("mongoose");

const RentalCarProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    telephoneNumber: {
      type: String,
      required: [true, "Please add a telephone number"],
    },
    price: {
      type: Number,
      require: [true, "Please add a price"],
      min: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Cascade delete appointments when a rental car provider is delete
RentalCarProviderSchema.pre("remove", async function (next) {
  console.log(
    `Appointments being removed from rental car provider ${this._id}`
  );
  await this.model("Appointment").deleteMany({ rentalCarProvider: this._id });
  next();
});

//Reverse populate with virtuals
RentalCarProviderSchema.virtual("appointments", {
  ref: "Appointment",
  localField: "_id",
  foreignField: "rentalcarProvider",
  justOne: false,
});

module.exports = mongoose.model("RentalCarProvider", RentalCarProviderSchema);
