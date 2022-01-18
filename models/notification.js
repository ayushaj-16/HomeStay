var mongoose = require("mongoose");

var notificationSchema = new mongoose.Schema({
	username: String,
	userId: String,
	accomodationId: String,
	stayName: String,
	isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notification", notificationSchema);