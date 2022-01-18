const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const Notification = require('../models/notification');
const Comment = require('../models/comment');
const middleware = require('../middleware');
const User = require('../models/user');

// var NodeGeocoder = require('node-geocoder');
 
// var options = {
//   provider: 'google',
//   httpAdapter: 'https',
//   apiKey: process.env.GEOCODER_API_KEY,
//   formatter: null
// };
 
// var geocoder = NodeGeocoder(options);

//INDEX - Show all Campgrounds
router.get("/", (req, res) => {
  var noMatch = null;
  var search = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    search = req.query.search;
    Campground.find({name:regex}, (err, allCamp) => {
      if(err) {
        req.flash("error", "Campground not found");
        res.redirect("back");
      }
      else {
        if(allCamp.length === 0)
          noMatch = "No campgrounds match that query, please try again.";
        res.render("campgrounds/index", {locations: allCamp, page: "campgrounds", noMatch: noMatch, search: search});
      }
    });
  }
  else {
    //Get all campgrounds from DB
    Campground.find({}, (err, allCamp) => {
      if(err || !allCamp) {
        req.flash("error", "Campground not found");
        res.redirect("back");
      }
      else
        res.render("campgrounds/index", {locations: allCamp, page: "campgrounds", noMatch: noMatch, search: search});
    });
  }
});
  
// NEW - Show form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, async (req, res) => { 
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var price = req.body.price;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  // geocoder.geocode(req.body.location, function (err, data) {
  //   if (err || !data.length) {
  //     console.log(err);
  //     req.flash('error', 'Invalid address');
  //     return res.redirect('back');
  //   }
  //   var lat = data[0].latitude;
  //   var lng = data[0].longitude;
  //   var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, price: price, author:author/*, location: location, lat: lat, lng: lng*/};
    try {
      // Create a new campground and save to DB
      let campground = await Campground.create(newCampground);
      let user = await User.findById(req.user._id).populate('followers').exec();
      //eval(require('locus'));
      if (!user)
        throw "user not found";
      let newNotification = {
        username: req.user.username,
        userId: req.user.id,
        campgroundId: campground.id,
        campName: campground.name
      }
      for(const follower of user.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
      }
      //redirect back to campgrounds page
      req.flash("success", "Campground added succesfully!");
      res.redirect(`/campgrounds/${campground.id}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  // });
});

// SHOW - Show detailed info about a campground
router.get("/:id", (req, res) => {
  //find the campground with provided ID
  Campground.findById(req.params.id).populate('comments').exec((err, camp) => {
    if(err || !camp) {
      req.flash("error", "Campground not found");
      res.redirect("back");
    }  else {
      //render show template with that campground
      res.render("campgrounds/show", {location: camp});
    }
  });
});

// EDIT - show form to edit an existing campground 
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if(err || !foundCampground) {
      req.flash("error", "Campground not found");
      return res.redirect("back");
    }
    res.render("campgrounds/edit", {location: foundCampground});
  });
});

// UPDATE - add updated campground to DB
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  // geocoder.geocode(req.body.location, function (err, data) {
  //   if (err || !data.length) {
  //     req.flash('error', 'Invalid address');
  //     return res.redirect('back');
  //   }
  //   req.body.campground.lat = data[0].latitude;
  //   req.body.campground.lng = data[0].longitude;
  //   req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.camp, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + foundCampground._id);
        }
    });
  // });
});

// DESTROY - delete an existing campground
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err,camp) => {
    if(err || !camp){
      req.flash("error", "failed to delete campground");
      res.redirect("back");
    }
    Comment.deleteMany({
      _id: {
        $in: camp.comments
      }
    }, function(err, comment) {
      if(err || !comment) {
        res.flash("error","failed to delete associated comments");
        return res.redirect("back");
      }
      req.flash('error', camp.name + ' deleted!');
      res.redirect('/campgrounds');
    })
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;