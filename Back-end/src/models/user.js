const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  id_user: { type: String },
  name: { type: String },
  email: { type: String },
  image_url: { type: String },
  bio: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }],
  firstLogin: { type: Date, default: Date.now },
  phone: { type: String },
  dob: { type: String }  
});

module.exports = mongoose.model("User", User);
