const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listings");
const bookingController = require("../controllers/booking");
const { isLoggedIn, handleMulterError } = require("../middleware");

// Routes
router.get("/", listingController.index);
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.post("/", isLoggedIn, handleMulterError, listingController.create);
router.post("/:id/reserve", bookingController.createBooking);

router.get("/recommendations", listingController.showRecommendations);
router.get("/:id", listingController.show);
router.get("/:id/edit", isLoggedIn, listingController.renderEditForm);
router.put("/:id", isLoggedIn, handleMulterError, listingController.update);
router.delete("/:id", isLoggedIn, listingController.destroyListing);

module.exports = router;
