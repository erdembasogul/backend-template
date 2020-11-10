const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) return done(err, null, "Bir Hata Olustu");

      if (!user) {
        return done(null, false, "User Not Found");
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // << req.user >> //
          return done(null, user, "Successfully Logged In");
        } else {
          return done(null, false, "Incorrect Password");
        }
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
