const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  niveau: {type: String, required: true},
  userName: {type: String, required: true},
  title: {type: String, required: true},
  body: {type: String, required: true},
  creationDate: {type: Date,default:Date.now},
});
module.exports = mongoose.model('Notification', notificationSchema);
