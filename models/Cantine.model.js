const mongoose = require('mongoose');
const cantineSchema = new mongoose.Schema({
  day: {type: String, required: true},
  menu: {type: String, required: true},
});
module.exports = mongoose.model('Cantine', cantineSchema);
    