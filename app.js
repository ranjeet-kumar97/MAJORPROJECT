if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}


const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const dburl = process.env.ATLASDB_URL;
main()
 .then(() => {
    console.log("connect to DB");
 }).catch((err) => {
    console.log(err);
});


async function main(){
     await mongoose.connect(dburl);

};

app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
 



const store = MongoStore.create({
    mongoUrl:dburl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error",() =>{
    console.log("ERROR IN MONGO SESSION STORE",err);
});



const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
       expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
       maxAge: 7 * 24 * 60 * 60 * 1000,
       httpOnly: true,
    },
};




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// meddileware =>messge flash karne ke liye sabhi Route se uper likhana hai.
app.use((req,res,next) => {
    res.locals.success = req.flash("success");
     res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


//Route
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/", userRouter);


//page not found route
app.all("/*splat",(req,res,next) => {
    next(new ExpressError(404,"Page Not Found!"));
});

// Error handling by middlewares//and ExpressError
app.use((err,req,res,next) => {
    let {statusCode =500,message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
    
});





app.listen(port,(req,res) => {
    console.log(`server is listing to port ${port}`);
});