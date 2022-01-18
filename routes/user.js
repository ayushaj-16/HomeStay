const express       = require('express'),
      router        = express.Router(),
      Campground    = require('../models/campground'),
      Notification  = require('../models/notification'),
      middleware    = require('../middleware'),
      User          = require('../models/user');
    
// User Profile
router.get("/:id", (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if(err || !foundUser) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }
    else {
      Campground.find().where('author.id').equals(foundUser._id).populate('followers').exec((err, camps) => {
        if(err || !camps) {
          req.flash("error", err);
          res.redirect("/");
        }
        else {
          var hasFollowed = false;
          if(req.user && foundUser.followers.indexOf(req.user.id) !== -1) 
            hasFollowed = true;
          res.render("users/show", {user: foundUser, camps, hasFollowed});
        }
      });
    }
  })
});

// Update User profile
router.put("/:id", (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if(err || !foundUser) {
      req.flash("error", "Updation failed.");
      return res.redirect("/campgrounds");
    }
    if(req.body.bio.length > 0)
      foundUser.bio = req.body.bio;
    foundUser.save();
    res.redirect(`/user/${foundUser.id}`);
  });
});

// follow user
router.get('/follow/:id', middleware.isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.params.id);
    if(!user) 
      throw "user not found";
    if(user.id === req.user._id)
      throw "Cannot follow yourself!";
    user.followers.push(req.user._id);
    let newNotification = {
      username: req.user.username,
      userId: req.user.id,
      campgroundId: null,
      campName: null
    }
    let notification = await Notification.create(newNotification);
    user.notifications.push(notification);
    user.save();
    req.flash('success', 'Successfully followed ' + user.username + '!');
    res.redirect('/user/' + req.params.id);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// unfollow user
router.get('/unfollow/:id', middleware.isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.params.id);
    if(!user) 
      throw "user not found";
    while(user.followers.indexOf(req.user._id)!= -1) 
      user.followers.pop(req.user._id);
    let prevNotifications = await Notification.find({'userId': req.user.id, 'campName': null});
    if(prevNotifications) {
      for(notification of prevNotifications) {
        await Notification.findByIdAndRemove(notification);
        user.notifications.pop(notification._id);
      }
    }
    user.save();
    req.flash('success', 'Successfully unfollowed ' + user.username + '!');
    res.redirect('/user/' + req.params.id);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// view all notifications
router.get('/notifications/all', middleware.isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.user._id).populate({
      path: 'notifications',
      options: { sort: { "_id": -1 } }
    }).exec();
    if(!user) 
      throw "user not found";
    let allNotifications = user.notifications;
    res.render('notifications/index', { allNotifications });
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// handle notification
router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
  try {
    let notification = await Notification.findById(req.params.id);
    if(!notification) 
      throw "Notifications not found";
    notification.isRead = true;
    notification.save();
    if(notification.campgroundId === null)
      res.redirect(`/user/${notification.userId}`);
    else
      res.redirect(`/campgrounds/${notification.campgroundId}`);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

module.exports = router;