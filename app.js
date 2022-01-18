require('dotenv').config();

/* ---------Order of lines is important---------------- */
/* -----------Do not alter order, ie. ----------------- */
/* -----Passport config first, then app config--------- */
const express         = require('express'), 
      bodyParser      = require('body-parser'), 
      app             = express(),
      mongoose        = require('mongoose'),
      passport        = require('passport'),
      flash           = require('connect-flash'),
      methodOverride  = require('method-override'),
      LocalStrategy   = require('passport-local'),
      User            = require('./models/user'),
      seedDB          = require('./seeds');

// Requiring Routes
const CampgroundRoute     = require('./routes/campgrounds'),
      CommentRoute        = require('./routes/comments'),
      IndexRoute          = require('./routes/index'),
      UserRoute           = require('./routes/user'),
      ForgotPasswordRoute = require('./routes/forgotPassword');

// DATABASE SETUP
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost/Camp_India_final");
//seedDB(); //Seed the database

// PASSPORT CONFIG
app.use(require('express-session')({
  secret: "This is CampIndia Authentication.",
  saveUninitialized: false,
  resave: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(async (req, res, next) => {
  res.locals.currentUser = req.user;
  if(req.user) {
    try {
      let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
      res.locals.notifications = user.notifications.reverse();
      if(!user)
        throw "User not defined";
    } catch(err) {
      console.log(err.message);
    }
   }
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
app.locals.moment = require('moment');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// APP CONFIG
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));

// ROUTES CONFIG
app.use("/", IndexRoute);
app.use("/campgrounds", CampgroundRoute);
app.use("/campgrounds/:id/comments", CommentRoute);
app.use("/user", UserRoute);
app.use("/", ForgotPasswordRoute);
app.set("view engine", "ejs");

// PORT SETUP
app.listen(5500,() => {
  console.log("CampIndia Server has started!!");
});