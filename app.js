const express = require("express");
const userRouter = require("./routes/users");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./models/User");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const app = express();
const PORT = 3000 || process.env.PORT;

// << Flash Middlewares >> //
app.use(cookieParser("passport"));
app.use(
  session({
    cookie: { maxAge: 60000 },
    resave: true,
    secret: "passporttutorial",
    saveUninitialized: true,
  })
);
app.use(flash());

// << Passport Initialize >> //
app.use(passport.initialize());
app.use(passport.session());

// << Global - Res.Locals - Middleware >> //
app.use((req, res, next) => {
  // << Our own flash >> //
  res.locals.flashSuccess = req.flash("flashSuccess");
  res.locals.flashError = req.flash("flashError");

  // << Passport Flash >> //
  res.locals.passportFailure = req.flash("error");
  res.locals.passportSuccess = req.flash("success");

  // << Logged User >> //
  res.locals.user = req.user;

  next();
});

// << MongoDB Connection >> //
mongoose.connect("mongodb://localhost/passportdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("err", console.error.bind(console, "Connection Error"));
db.once("open", () => {
  console.log("Connected to Database");
});

// << Template Engine Middleware >> //
app.engine("handlebars", exphbs({ defaultLayout: "mainLayout" }));
app.set("view engine", "handlebars");

// << Body Parser Middleware >> //
app.use(bodyParser.urlencoded({ extended: false }));

// << Router Middleware >> //
app.use(userRouter);

app.get("/", (req, res) => {
  User.find({})
    .then((users) => {
      res.render("pages/index", {
        users: users.map((user) => user.toJSON()),
      });
    })
    .catch((err) => console.log(err));
});

app.use((req, res) => {
  res.render("static/404");
});

app.listen(PORT, () => {
  console.log("App Started");
});
