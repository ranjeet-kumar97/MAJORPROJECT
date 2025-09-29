const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/users.js");


//signup Route
router.route("/signup")
      .get(userController.renderSignupForm)
      .post(userController.signup);

//login Route
router.route("/login")
      .get(userController.renderLoginForm)
      .post(saveRedirectUrl, passport.authenticate("local",{failureRedirect: "/login",failureFlash: true,}), (userController.login));



//Logout Rought
router.get("/logout", (userController.logout));



module.exports = router;