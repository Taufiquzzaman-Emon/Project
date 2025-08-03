const User = require("../models/user");
module.exports.renderSignUp= (req, res) => {
    res.render("users/signup.ejs",{ hideNavbar: true });
  };

// Handle user registration

module.exports.signUp = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const regUser = await User.register(newUser, password);

    req.login(regUser, (err) => {
      if (err) return next(err);
      req.flash("success", `User ${regUser.username} registered successfully!`);
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", "User already exists. Try a different username or log in.");
    res.redirect("/register");
  }
};

// render login

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs", { hideNavbar: true });
  };

// Handle user login

module.exports.login = async(req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    const redirectUrl = res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
  };

// Handle user logout

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.flash("success", "Logged out successfully!");
      res.redirect("/listings");
    });
  };