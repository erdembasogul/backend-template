const formValidation = require("../validation/formValidation");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passport = require("passport");
require("../authentication/passport/local");

module.exports.getUserLogin = (req, res) => {
  res.render("pages/login");
};
module.exports.getUserLogout = (req, res) => {
  req.logout()
  req.flash('success','Successfully Logout')
  res.redirect('/login')
};
module.exports.getUserRegister = (req, res) => {
  res.render("pages/register");
};
module.exports.postUserLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: true,
  })(req, res, next);
};
module.exports.postUserRegister = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const errors = [];
  const validationErrors = formValidation.registerValidation(
    username,
    password
  );
  // << Server Side Validation >> //
  if (validationErrors.length > 0) {
    return res.render("pages/register", {
      username,
      password,
      errors: validationErrors,
    });
  }
  User.findOne({ username })
    .then((user) => {
      // << Email Validation >> //
      if (user) {
        errors.push({ message: "Username Already In User" });
        return res.render("pages/register", {
          username,
          password,
          errors,
        });
      }
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          const newUser = User({
            username: username,
            password: hash,
          });
          newUser
            .save()
            .then(() => {
              console.log("Successful");
              req.flash("flashSuccess", "Successfully Registered");
              res.redirect("/");
            })
            .catch((err) => console.log(err));
        });
      });
    })
    .catch((err) => console.log(err));
};
