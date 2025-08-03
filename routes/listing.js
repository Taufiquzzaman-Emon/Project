const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listings");
const { isLoggedIn, handleMulterError } = require("../middleware");

// Routes
router.get("/", listingController.index);
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.post("/", isLoggedIn, handleMulterError, listingController.create);
router.get("/recommend", listingController.showRecommendations);
router.get("/:id", listingController.show);
router.get("/:id/edit", isLoggedIn, listingController.renderEditForm);
router.put("/:id", isLoggedIn, handleMulterError, listingController.update);
router.delete("/:id", isLoggedIn, listingController.destroyListing);

module.exports = router;
