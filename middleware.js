const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { voyagoDev } = require("./cloudConfig");
const { listingSchema, reviewSchema } = require("./schema.js");

// Middleware to check if user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    if (req.method === "GET") {
      req.session.redirectUrl = req.originalUrl;
    }
    req.flash("error", "You must be logged in to perform this action!");
    return res.redirect("/login");
  }
  next();
};

// Middleware to save redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Middleware to check if the logged-in user is the owner of the listing
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(req.user._id)) {
    const type = res.locals.permissionType || "perform this action";
    const msg = `You do not have permission to ${type} this listing.`;
    req.flash(type === "delete" ? "dlt" : "error", msg);
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// Middleware to validate listing data using Joi
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errorMessage = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errorMessage);
  } else {
    next();
  }
};

// Middleware to validate review data using Joi
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errorMessage = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errorMessage);
  } else {
    next();
  }
};

// Middleware to handle Multer image upload errors
module.exports.handleMulterError = (req, res, next) => {
  voyagoDev.single("listing[image]")(req, res, function (err) {
    if (err && err.code === "LIMIT_FILE_SIZE") {
      const redirectTo =
        req.method === "PUT"
          ? `/listings/${req.params.id}/edit`
          : "/listings/new";

      req.flash("error", "Image too large. Max file size is 1MB.");
      return res.redirect(redirectTo);
    } else if (err) {
      return next(err); // pass other Multer errors
    }
    next(); // No error
  });
};

// Middleware to check if the logged-in user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not have permission to delete this review.");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
