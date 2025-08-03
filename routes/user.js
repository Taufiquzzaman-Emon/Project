const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users");

// Render the and handle registration page
router
  .route("/register")
  .get(userController.renderSignUp)
  .post(wrapAsync(userController.signUp));

// Render and handle login page
router
  .route("/login")
  .get(userController.renderLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

// logout route
router.get("/logout", userController.logout);

module.exports = router;
