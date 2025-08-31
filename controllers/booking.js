const Booking = require("../models/booking");
const Listing = require("../models/listing");

// Create a new booking (User)
const createBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkin, checkout } = req.body;

    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    const booking = new Booking({
      listing: id,
      user: req.user._id,
      checkin,
      checkout,
      status: "pending",
    });
    await booking.save();

    req.flash("success", `Booking request sent to ${listing.owner.username}!`);
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect(`/listings/${req.params.id}`);
  }
};

// Show all bookings for logged-in user// bookingController.js
const showUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: "listing",
        populate: { path: "owner" },
      })
      .sort({ createdAt: -1 });

    // Correct folder name
    res.render("booking/showBookings", { bookings });
  } catch (e) {
    req.flash("error", "Could not fetch your bookings");
    res.redirect("/");
  }
};

// Show pending bookings for listings owned by user (Owner)
const showOwnerBookings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map((l) => l._id);

    const bookings = await Booking.find({
      listing: { $in: listingIds },
      status: "pending",
    })
      .populate("user listing")
      .sort({ createdAt: -1 });

    res.render("booking/ownerBookings", { bookings });
  } catch (err) {
    req.flash("error", "Could not fetch bookings");
    res.redirect("/");
  }
};

// Accept booking (Owner)
const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing");
    if (!booking.listing.owner.equals(req.user._id)) {
      req.flash("error", "Not authorized!");
      return res.redirect("/bookings/owner");
    }

    booking.status = "accepted";
    await booking.save();

    req.flash("success", "Booking accepted!");
    res.redirect("/bookings/owner");
  } catch (err) {
    req.flash("error", "Could not accept booking");
    res.redirect("/bookings/owner");
  }
};

// Reject booking (Owner)
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing");
    if (!booking.listing.owner.equals(req.user._id)) {
      req.flash("error", "Not authorized!");
      return res.redirect("/bookings/owner");
    }

    booking.status = "rejected";
    await booking.save();

    req.flash("success", "Booking rejected!");
    res.redirect("/bookings/owner");
  } catch (err) {
    req.flash("error", "Could not reject booking");
    res.redirect("/bookings/owner");
  }
};

module.exports = {
  createBooking,
  showUserBookings,
  showOwnerBookings,
  acceptBooking,
  rejectBooking,
};
