const express = require("express");
const {
  getRentalCarProviders,
  getRentalCarProvider,
  createRentalCarProvider,
  updateRentalCarProvider,
  deleteRentalCarProvider,
  // getVacCenters,
} = require("../controllers/rentalCarProvider");

//Include other resource router
const appointmentRouter = require("./appointments");

const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

//Re-route into other resource router
router.use("/:RentalCarProviderId/appointments/", appointmentRouter);

//router.route("/vacCenters").get(getVacCenters);

router
  .route("/")
  .get(getRentalCarProviders)
  .post(protect, authorize("admin"), createRentalCarProvider);
router
  .route("/:id")
  .get(getRentalCarProvider)
  .put(protect, authorize("admin"), updateRentalCarProvider)
  .delete(protect, authorize("admin"), deleteRentalCarProvider);

module.exports = router;
