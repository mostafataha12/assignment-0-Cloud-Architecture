const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("./config/mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
require("./config/passport_local");

const app = express();
const PORT = 3333;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "assets")));

app.use(
    session({
        secret: "yourSecretKey",
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success");
    res.locals.error_msg = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/habits", require("./routes/habit"));

app.use((req, res) => {
    res.status(404).render("404");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
