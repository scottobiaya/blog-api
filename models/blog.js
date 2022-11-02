const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const blogSchema = new mongoose.Schema({
  title: { type: String, default: null },
  description: { type: String, default: null },
  tags: { type: String },
  readCount: { type: Number, default: 0 },
  readingTime: {type: String }, // put string to allow for values such as 1 hour 30 mins etc.
  body: { type: String },
  timestamp: { type: Date, default: Date.now },
  state: {
    type:String,
    enum: ["draft", "published"]
  },
  author: {type: Schema.Types.ObjectId, ref: 'user'}
});

module.exports = mongoose.model("blog", blogSchema);