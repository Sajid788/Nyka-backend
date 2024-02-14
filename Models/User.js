const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 50 },
  avatar: {type: String,required: true,},
  email: { type: String, required: true, unique: true, match: /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/ },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
