const Appointment = require("../models/Appointment");
const User = require("../models/User");
const RentalCarProvider = require("../models/RentalCarProvider");

//@desc   Get all appointments
//@route GET /api/v1/appointments
//@access Public

exports.getAppointments = async (req, res, next) => {
  let query;
  //General users can see only their appointments!
  if (req.user.role !== "admin") {
    query = Appointment.find({ user: req.user.id }).populate({
      path: "rentalCarProvider",
      select: "name address telephoneNumber",
    });
  } else {
    //If you are an admin, you can see all!
    query = Appointment.find().populate({
      path: "rentalCarProvider",
      select: "name address telephoneNumber",
    });
  }
  try {
    const appointments = await query;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Appointment" });
  }
};

//@desc   Get single appointment
//@route  GET /api/v1/appointments/:id
//@access Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: "rentalCarProvider",
      select: "name description tel",
    });

    if (!appointment) {
      return res.status(400).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Appointment" });
  }
};

//@desc     Add appointment
//@route    POST /api/v1/RentalCarProviders/:RentalCarProviderId/appointment
//@access   Private
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.rentalCarProvider = req.params.RentalCarProviderId;
    console.log(req.params.RentalCarProviderId);
    const rentalCarProvider = await RentalCarProvider.findById(
      req.params.RentalCarProviderId
    );
    console.log(rentalCarProvider);
    if (!rentalCarProvider) {
      return res.status(404).json({
        success: false,
        message: `No RentalCarProvider with the id of ${req.params.RentalCarProviderId}`,
      });
    }

    //add user Id to req.body
    req.body.user = req.user.id;
    // console.log(req.user.id);
    //Check for existed appointment
    const existedAppointment = await Appointment.find({ user: req.user.id });
    const existedUser = await User.findById(req.user.id);
    //console.log(existedUser);

    //If the user is not an admin, they can only create 3 appointments.
    if (existedAppointment.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 appointments`,
      });
    }

    const carPrice = rentalCarProvider.price;
    const insurance = req.body.isInsurance ? 1000 : 0;
    var creditPoint = req.body.creditPoint;

    creditPoint = Math.min(carPrice + insurance, creditPoint);

    req.body.creditPoint = creditPoint;

    req.body.totalPrice = calPrice(carPrice, insurance, creditPoint);

    if (existedUser.creditPoint < creditPoint) {
      return res
        .status(400)
        .json({ success: false, message: "Credit point not enoughs" });
    }

    const appointment = await Appointment.create(req.body);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      creditPoint: existedUser.creditPoint - creditPoint,
    });
    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ success: false, message: "Cannot create Appointment" });
  }
};

//@desc     Update appointment
//@route    PUT /api/v1/appointments/:id
//@access   Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    //Make sure user is the appointment owner
    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this appointment`,
      });
    }

    if (req.body.creditPoint) {
      return res.status(400).json({
        success: false,
        message: "credit point can not be changed",
      });
    }

    if (req.body.totalPrice) {
      return res.status(400).json({
        success: false,
        message: "total price can not be changed",
      });
    }
    if (req.body.rentalCarProvider) {
      const rentalCarProvider = await RentalCarProvider.findById(
        req.body.rentalCarProvider
      );

      const newCarPrice = rentalCarProvider.price;
      const insurance = req.body.isInsurance ? 1000 : 0;
      var creditPoint = appointment.creditPoint;
      //console.log("hello");
      creditPoint = Math.min(newCarPrice + insurance, creditPoint);
      req.body.creditPoint = creditPoint;
      req.body.totalPrice = calPrice(
        newCarPrice,
        req.body.isInsurance,
        creditPoint
      );
    }
    //console.log(req.body);

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Cannot update Appointment",
    });
  }
};

//@desc     Delete appointment
//@route    DELETE/api/v1/appointments/:id
//@access   Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    //Make sure user is the appointment owner
    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this bootcamp`,
      });
    }

    await appointment.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Appointment" });
  }
};

//@desc     End appointment
//@route    DELETE/api/v1/appointments/end/:id
//@access   Private
exports.endAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    //Make sure user is the appointment owner
    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this bootcamp`,
      });
    }

    const userId = appointment.user;

    const updateUser = await User.findByIdAndUpdate(userId, {
      $inc: { creditPoint: appointment.totalPrice / 100 },
    });

    await appointment.remove();

    res.status(200).json({
      success: true,
      data: {
        message: `End appointment Sucessful.You receive ${
          appointment.totalPrice / 100
        } credit points.`,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Appointment" });
  }
};

const calPrice = (rentPrice, isInsurance, creditPoint) => {
  return rentPrice - creditPoint + (isInsurance ? 1000 : 0);
};
