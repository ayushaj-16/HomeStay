const express = require('express');
const router = express.Router({mergeParams: true});
const Accomodation = require('../models/accomodation');
const Comment = require('../models/comment');
const middleware = require('../middleware');

// Create new comment
router.get("/new", middleware.isLoggedIn, (req, res) => {
  Accomodation.findById(req.params.id, (err,stay) =>{
    if(err || !stay) {
      req.flash("error", "Associated accomodation not found");
      res.redirect("back");
    }
    else {
      res.render("comments/new",{location: stay});
    }
  });
});

// CREATE - Adding comment logic
router.post("/", middleware.isLoggedIn, (req, res) => {
  //lookup accomodation using ID
  Accomodation.findById(req.params.id, (err, stay) => {
    if(err || !stay) {
      req.flash("error", "Accomodation not found");
      res.redirect("back");
    }
    else {
      //create new comment
      Comment.create(req.body.comment, (err,comment) => {
        if(err) {
          req.flash("error", "Failed to create comment");
          console.log(err);
        }
        else {
          //add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          //connect new comment to accomodation
          stay.comments.push(comment);
          stay.save();
          //redirect to accomodation show page
          req.flash("success", "Successfully added comment");
          res.redirect(`/accomodations/${stay.id}`);
        }
      });
    }
      
  });
});

// EDIT - editing an existing comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership,(req, res) => {
  Accomodation.findById(req.params.id, (err, stay) => {
    if(err || !stay) {
      req.flash("error", "Accomodation not found");
      return res.redirect("back");
    }
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if(err || !foundComment) {
        req.flash("error", "Comment not found");
        res.redirect("back");
      }else
        res.render("comments/edit", {location_id : req.params.id, comment: foundComment});
    });
  });
});

// UPDATE - update route for comment
router.put("/:comment_id", middleware.checkCommentOwnership,(req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
    if(err || !updatedComment) {
      req.flash("error", "Comment not found");
      res.redirect("back");
    }
    else {
      req.flash("success", "Successfully updated comment!");
      res.redirect(`/accomodations/${req.params.id}`);
    }
  });
});

// DESTROY - delete an existing comment
router.delete("/:comment_id" , middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err, foundComment) => {
    if(err || !foundComment) {
      req.flash("error", "Failed to delete comment");
      res.redirect("back");
    }
    else {
      req.flash("error", "Comment deleted")
      res.redirect(`/accomodations/${req.params.id}`);
    }
  });
});

module.exports = router;