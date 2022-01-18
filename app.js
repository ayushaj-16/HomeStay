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
const AccomodationRoute     = require('./routes/accomodations'),
      CommentRoute        = require('./routes/comments'),
      IndexRoute          = require('./routes/index'),
      UserRoute           = require('./routes/user'),
      ForgotPasswordRoute = require('./routes/forgotPassword');

// Session information storing
const session = require('express-session');
const MongoDBStore = require('connect-mongo');

// DATABASE SETUP
const mongoAtlasUrl = "mongodb://localhost/Camp_India_final"; //process.env.DB_URL;
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
//currently running at mongoDB Atlas
mongoose.connect(mongoAtlasUrl);  //can switch to localhost url - mongodb://localhost/Camp_India_final
//seedDB(); //Seed the database

// SESSION CONFIG

const sessionConfig = {
  name: 'session',
  secret: "This is HomeStay Authentication.",
  saveUninitialized: false,
  resave: false,
  store: MongoDBStore.create({
    mongoUrl: mongoAtlasUrl,
  }),
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000*60*60*24*7,    // expires in 1 day (time in milliseconds)
    maxAge: 1000*60*60*24*7
  }
};

// PASSPORT CONFIG
app.use(session(sessionConfig));
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
app.use("/accomodations", AccomodationRoute);
app.use("/accomodations/:id/comments", CommentRoute);
app.use("/user", UserRoute);
app.use("/", ForgotPasswordRoute);
app.set("view engine", "ejs");

// PORT SETUP
app.listen(5500,() => {
  console.log("HomeStay Server has started!!");
});