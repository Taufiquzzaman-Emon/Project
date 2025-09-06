if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("express-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Booking = require("./models/booking");
const Listing = require("./models/listing");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRoutes = require("./routes/bookings");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// --- Connect to MongoDB ---
const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB");
}

main().catch((err) => console.log("MongoDB connection error:", err));

// --- View Engine & Middleware ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// --- Session & Flash ---
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => console.log("Session Store Error:", err));

app.use(
  session({
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  })
);

app.use(flash());

// --- Passport ---
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --- Make user & flash available in all views ---
app.use((req, res, next) => {
  res.locals.currUser = req.user || null; // so EJS can use currUser safely
  res.locals.success = req.flash("success") || [];
  res.locals.dlt = req.flash("dlt") || [];
  res.locals.error = req.flash("error") || [];
  next();
});

const callbackURL =
  process.env.NODE_ENV === "production"
    ? "https://voyago-m426.onrender.com/auth/google/callback"
    : "http://localhost:8001/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          // Don't set password for OAuth users
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// --- Make pending booking count available globally ---
app.use(async (req, res, next) => {
  if (req.user) {
    try {
      // Get listings owned by current user
      const listings = await Listing.find({ owner: req.user._id });
      const listingIds = listings.map((l) => l._id);

      // Count pending bookings for these listings
      const pendingCount = await Booking.countDocuments({
        listing: { $in: listingIds },
        status: "pending",
      });

      res.locals.pendingCount = pendingCount;
    } catch (err) {
      res.locals.pendingCount = 0;
    }
  } else {
    res.locals.pendingCount = 0;
  }
  next();
});

// --- Routes ---
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/bookings", bookingRoutes); // booking routes
app.use("/", userRouter);

// --- MapLibre static ---
app.use(
  "/maplibre",
  express.static(path.join(__dirname, "node_modules/maplibre-gl/dist"))
);

// --- Favicon ignore ---
app.get("/favicon.ico", (req, res) => res.status(204).end());

// --- 404 handler ---
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// --- Start Server ---
app.listen(8001, () => {
  console.log("Server is running on port 8001");
});
