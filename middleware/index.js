const Accomodation = require("../models/accomodation");
const Comment = require("../models/comment");

// all middlewares goes here

middlewareObj = {},

middlewareObj.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  req.flash("error", "You must be signed in to do that");
  res.redirect("/login");
};

middlewareObj.checkAccomodationOwnership = (req, res, next) => {
  if(req.isAuthenticated()) {    
    Accomodation.findById(req.params.id, (err, foundAccomodation) => {
      if(err || !foundAccomodation) {
        req.flash("error", "Accomodation not found");
        res.redirect("back");
      }
      else {
        if(foundAccomodation.author.id.equals(req.user._id) || req.user.isAdmin)
          next();
        else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  }
  else {
    req.flash("error", "You need to be signed in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkCommentOwnership = (req, res, next) => {
  if(req.isAuthenticated()) {    
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if(err || !foundComment) {
        req.flash("error", "Comment not found");
        res.redirect("back");
      }
      else {
        if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin)
          next();
        else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  }
  else {
    req.flash("error", "You need to be signed in to do that");
    res.redirect("back");
  }
};

module.exports = middlewareObj;