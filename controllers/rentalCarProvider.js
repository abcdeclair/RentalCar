const RentalCarProvider = require("../models/RentalCarProvider");

//@desc   Get all rental car providers
//@route  GET /api/v1/rentalCarProviders
//@access Public
exports.getRentalCarProviders = async (req, res, next) => {
  try {
    let query;

    //Copy req.query
    const reqQuery = { ...req.query };

    //Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    query = RentalCarProvider.find(JSON.parse(queryStr)).populate("appointments");

    //Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createAt");
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await RentalCarProvider.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const rentalCarProviders = await query;

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: rentalCarProviders.length,
      pagination,
      data: rentalCarProviders,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc   Get single rental car provider
//@route  GET /api/v1/rentalCarProviders/:id
//@access Public
exports.getRentalCarProvider = async (req, res, next) => {
  try {
    const rentalCarProvider = await RentalCarProvider.findById(req.params.id);

    if (!rentalCarProvider) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: rentalCarProvider });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc   Create new rental car provider
//@route  POST /api/v1/rentalCarProvider
//@access Private
exports.createRentalCarProvider = async (req, res, next) => {
  const rentalCarProvider = await RentalCarProvider.create(req.body);
  res.status(201).json({ success: true, data: rentalCarProvider });
};

//@desc   Update rental car provider
//@route  PUT /api/v1/rentalCarProviders/:id
//@access Private
exports.updateRentalCarProvider = async (req, res, next) => {
  try {
    const rentalCarProvider = await RentalCarProvider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!rentalCarProvider) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: rentalCarProvider });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc   Delete rental car provider
//@route  DELETE /api/v1/rentalCarProviders/:id
//@access Private
exports.deleteRentalCarProvider = async (req, res, next) => {
  try {
    const rentalCarProvider = await RentalCarProvider.findById(req.params.id);

    if (!rentalCarProvider) {
      return res.status(400).json({ success: false });
    }

    rentalCarProvider.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Delete appointment
//@route    DELETE /api/v1/appointments/:id
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
