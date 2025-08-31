const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking");
const { isLoggedIn } = require("../middleware");

// User routes
router.get("/", isLoggedIn, bookingController.showUserBookings); // Show all bookings for logged-in user
router.post("/:id/reserve", isLoggedIn, bookingController.createBooking); // Reserve a listing

// Owner routes
router.get("/owner", isLoggedIn, bookingController.showOwnerBookings); // Owner view pending bookings
router.post("/:id/accept", isLoggedIn, bookingController.acceptBooking); // Accept booking
router.post("/:id/reject", isLoggedIn, bookingController.rejectBooking); // Reject booking

module.exports = router;
