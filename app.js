if(process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const MAPTILER_API_KEY = process.env.MAPTILER_API_KEY;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const dbUrl = process.env.ATLASDB_URL;
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("express-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

main()
.then(()=>{
  console.log("connected to MongoDB");
})
.catch((err) => {
  console.log("MongoDB connection error:", err);
});

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

app.use('/maplibre', express.static(path.join(__dirname, 'node_modules/maplibre-gl/dist')));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter:24 * 3600,
});

store.on("error", (err) => {
  console.log("Session Store Error:", err);
});


const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


// Session and Flash configuration

app.use(session(sessionOptions));
app.use(flash());

// Passport configuration

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to set flash messages in res.locals for use in views

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.dlt = req.flash("dlt");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

main()
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Favicon ignore
app.get("/favicon.ico", (req, res) => res.status(204).end());

// 404 handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Global error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8001, () => {
  console.log("Server is running on port 8001");
});
