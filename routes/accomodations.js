const express = require('express');
const router = express.Router();
const Accomodation = require('../models/accomodation');
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

//INDEX - Show all Accomodations
router.get("/", (req, res) => {
  var noMatch = null;
  var search = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    search = req.query.search;
    Accomodation.find({name:regex}, (err, allStay) => {
      if(err) {
        req.flash("error", "Accomodation not found");
        res.redirect("back");
      }
      else {
        if(allStay.length === 0)
          noMatch = "No accomodations match that query, please try again.";
        res.render("accomodations/index", {locations: allStay, page: "accomodations", noMatch: noMatch, search: search});
      }
    });
  }
  else {
    //Get all accomodations from DB
    Accomodation.find({}, (err, allStay) => {
      if(err || !allStay) {
        req.flash("error", "Accomodation not found");
        res.redirect("back");
      }
      else
        res.render("accomodations/index", {locations: allStay, page: "accomodations", noMatch: noMatch, search: search});
    });
  }
});
  
// NEW - Show form to create new accomodation
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("accomodations/new");
});

// CREATE - add new accomodation to DB
router.post("/", middleware.isLoggedIn, async (req, res) => { 
  // get data from form and add to accomodations array
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
    var newAccomodation = {name: name, image: image, description: desc, price: price, author:author/*, location: location, lat: lat, lng: lng*/};
    try {
      // Create a new accomodation and save to DB
      let accomodation = await Accomodation.create(newAccomodation);
      let user = await User.findById(req.user._id).populate('followers').exec();
      //eval(require('locus'));
      if (!user)
        throw "user not found";
      let newNotification = {
        username: req.user.username,
        userId: req.user.id,
        accomodationId: accomodation.id,
        stayName: accomodation.name
      }
      for(const follower of user.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
      }
      //redirect back to accomodations page
      req.flash("success", "Accomodation added succesfully!");
      res.redirect(`/accomodations/${accomodation.id}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  // });
});

// SHOW - Show detailed info about a accomodation
router.get("/:id", (req, res) => {
  //find the accomodation with provided ID
  Accomodation.findById(req.params.id).populate('comments').exec((err, stay) => {
    if(err || !stay) {
      req.flash("error", "Accomodation not found");
      res.redirect("back");
    }  else {
      //render show template with that accomodation
      res.render("accomodations/show", {location: stay});
    }
  });
});

// EDIT - show form to edit an existing accomodation 
router.get("/:id/edit", middleware.checkAccomodationOwnership, (req, res) => {
  Accomodation.findById(req.params.id, (err, foundAccomodation) => {
    if(err || !foundAccomodation) {
      req.flash("error", "Accomodation not found");
      return res.redirect("back");
    }
    res.render("accomodations/edit", {location: foundAccomodation});
  });
});

// UPDATE - add updated accomodation to DB
router.put("/:id", middleware.checkAccomodationOwnership, function(req, res){
  // geocoder.geocode(req.body.location, function (err, data) {
  //   if (err || !data.length) {
  //     req.flash('error', 'Invalid address');
  //     return res.redirect('back');
  //   }
  //   req.body.accomodation.lat = data[0].latitude;
  //   req.body.accomodation.lng = data[0].longitude;
  //   req.body.accomodation.location = data[0].formattedAddress;

    Accomodation.findByIdAndUpdate(req.params.id, req.body.stay, function(err, foundAccomodation){
        if(err || !foundAccomodation){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/accomodations/" + foundAccomodation._id);
        }
    });
  // });
});

// DESTROY - delete an existing accomodation
router.delete("/:id", middleware.checkAccomodationOwnership, (req, res) => {
  Accomodation.findByIdAndRemove(req.params.id, (err,stay) => {
    if(err || !stay){
      req.flash("error", "failed to delete accomodation");
      res.redirect("back");
    }
    Comment.deleteMany({
      _id: {
        $in: stay.comments
      }
    }, function(err, comment) {
      if(err || !comment) {
        res.flash("error","failed to delete associated comments");
        return res.redirect("back");
      }
      req.flash('error', stay.name + ' deleted!');
      res.redirect('/accomodations');
    })
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;