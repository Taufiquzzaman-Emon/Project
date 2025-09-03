const Listing = require("../models/listing");
const Sentiment = require("sentiment");
const sentiment = new Sentiment();
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const axios = require("axios");

// All listings
module.exports.index = async (req, res) => {
  try {
    const { location } = req.query;
    let allListings;

    if (location && location.trim() !== "") {
      // Filter listings by location (case-insensitive partial match)
      allListings = await Listing.find({
        location: { $regex: location, $options: "i" },
      });
    } else {
      // No search term, show all listings
      allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings, searchTerm: location });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load listings.");
    res.redirect("/");
  }
};

// New listing form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// Show single listing
module.exports.show = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/showListing.ejs", {
    listing,
    maptilerApiKey: process.env.MAPTILER_API_KEY,
    listingCoordinates: listing.geometry.coordinates,
  });
};

//  Show recommendations based on reviews and ratings
module.exports.showRecommendations = async (req, res) => {
  try {
    const allListings = await Listing.find({}).populate("reviews");

    const listingScores = [];

    allListings.forEach((listing) => {
      if (!listing.reviews || listing.reviews.length === 0) return;

      // Calculate average rating for the listing
      const avgRating =
        listing.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        listing.reviews.length;

      // Combine all comments into one string
      const combinedComments = listing.reviews.map((r) => r.comment).join(" ");

      // Analyze sentiment using the sentiment library
      const sentimentResult = sentiment.analyze(combinedComments);
      const sentimentScore = sentimentResult.comparative; // normalized score

      // Filter out listings with negative sentiment or low ratings
      if (sentimentScore < 0 || avgRating < 3.5) return;

      // Combine rating and sentiment (adjust weights as needed)
      const finalScore = avgRating * 0.6 + sentimentScore * 0.4;

      listingScores.push({ listing, score: finalScore });
    });

    // Sort descending by finalScore
    listingScores.sort((a, b) => b.score - a.score);

    // Map to just listings for rendering
    const recommended = listingScores.map((item) => item.listing);

    if (recommended.length === 0) {
      req.flash(
        "error",
        "No recommendations found based on reviews and ratings."
      );
      return res.redirect("/listings");
    }

    res.render("listings/recommendations.ejs", { recommended });
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not load recommendations");
    res.redirect("/listings");
  }
};
// Create listing
module.exports.create = async (req, res) => {
  try {
    if (!req.file) {
      req.flash("error", "Please upload an image.");
      return res.redirect("/listings/new");
    }

    const location = req.body.listing.location;

    // ✅ Use axios to call MapTiler's geocoding API
    const geoResponse = await axios.get(
      "https://api.maptiler.com/geocoding/" +
        encodeURIComponent(location) +
        ".json",
      {
        params: {
          key: process.env.MAPTILER_API_KEY,
        },
      }
    );

    const features = geoResponse.data.features;

    if (!features || features.length === 0) {
      req.flash("error", "Location not found.");
      return res.redirect("/listings/new");
    }

    const [longitude, latitude] = features[0].geometry.coordinates;
    const { path: url, filename } = req.file;

    const newListing = new Listing({
      ...req.body.listing,
      owner: req.user._id,
      image: { url, filename },
      geometry: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    await newListing.save();
    req.flash("success", "Successfully Created New Listing!");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/listings/new");
  }
};

// Edit form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  let originalImage = listing.image.url;
  originalImage = listing.image.url.replace(
    "/upload",
    "/upload/w_200,h_150,c_limit"
  );
  res.render("listings/edit.ejs", { listing, originalImage });
};

module.exports.update = async (req, res) => {
  const { id } = req.params;

  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    const location = req.body.listing.location;

    // Use axios to call MapTiler geocoding API
    const geoResponse = await axios.get(
      "https://api.maptiler.com/geocoding/" +
        encodeURIComponent(location) +
        ".json",
      {
        params: {
          key: process.env.MAPTILER_API_KEY,
        },
      }
    );

    const features = geoResponse.data.features;

    if (!features || features.length === 0) {
      req.flash("error", "Location not found.");
      return res.redirect(`/listings/${id}/edit`);
    }

    const [longitude, latitude] = features[0].geometry.coordinates;

    // Update listing fields including geometry
    listing.set({
      ...req.body.listing,
      geometry: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    // Update image if new file uploaded
    if (req.file) {
      const { path: url, filename } = req.file;
      listing.image = { url, filename };
    }

    await listing.save();

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while updating.");
    res.redirect(`/listings/${id}/edit`);
  }
};

// Delete listing
module.exports.destroyListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("dlt", "List deleted!");
  res.redirect("/listings");
};
