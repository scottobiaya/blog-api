const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
  // blog: [{ type: Schema.Types.ObjectId, ref: 'blog' }]
});

module.exports = mongoose.model("user", userSchema);