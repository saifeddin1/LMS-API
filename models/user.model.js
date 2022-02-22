const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const bcrypt = require("bcrypt");
const saltFactor = 10;

/**
 * Schema for user
 * @property {String}     password          password of user
 * @property {String}     username          username of user
 * @property {String}     email             email of user
 * @property {String}     type              "ESTUDENT": EUNOIA Learner, "EINSTRUCTOR": EUNOIA Consultant
 * @property {Number}     credit            mock money
 * @property {[String]}   chats             ids of chats that the user is in
 * @property {String}     studentNiveauId            studentNiveauId
 */
const userSchema = new Schema({
  username: {
    type: String,
    trim: true,
    unique: "username already registered",
    required: "username is required"
  },
  // password: {
  //   type: String,
  //   required: "password is required",
  // },
  email: {
    type: String,
    trim: true,
    required: "email is required",
    unique: "email already registered",
    match: [/.+\@.+\..+/, "Valid email required"],
  },
  type: {
    type: String,
    trim: true,
    required: "Specify Type of User",
  },
  
  studentNiveauId: {
    type: mongoose.Types.ObjectId,
    ref: "Niveau"
  },
  studentOffreId: {
    type: mongoose.Types.ObjectId,
    ref: "Offre"
  },
  profile: {
    type: {
      fullName: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
      linkedIn: { type: String, default: "", trim: true },
      facebook: { type: String, default: "", trim: true },
    },
    default: new Object()
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  permissions: {
    type: {
      chapitre: { type: Boolean, default: false },
      media: { type: Boolean, default: false },
      seance: { type: Boolean, default: false },
      homework: { type: Boolean, default: false },
    },
    default: new Object()
  },
  credit: { type: Number, default: 0 },
  chats: { type: [String], default: new Array() },
  currentToken: { type: String, default: "" },
}, { timestamps: true });

/**
 * https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1
 *
 * @param {String}   newPass  the new password
 * @param {function} callBack any function you pass, err passed for error handling
 */
userSchema.methods.comparePassword = function (newPass, callBack) {
  bcrypt.compare(newPass, this.password, function (err, isMatch) {
    if (err) return callBack(err);

    // err is null here since compare didn't throw an err
    callBack(null, isMatch);
  });
};

userSchema.pre("save", function (next) {
  let doc = this;
  console.log("user pre save.")
  if (doc.username) doc.username = doc.username.toLowerCase()
  if (doc.email) doc.email = doc.email.toLowerCase()

  // check if password was modified or not
  if (!doc.isModified("password")) return next();

  // generate the hash and store password
  bcrypt.hash(doc.password, saltFactor, (err, hash) => {
    if (err) return next(err);
    doc.password = hash;
    next();
  });
});

userSchema.post("save", function (doc, next) {
  console.log("user saved.")
  doc.populate('studentNiveauId').populate('studentOffreId').execPopulate().then(function () {
    next();
  });

})

const User = model("User", userSchema);
module.exports = User;
