const mongoose = require("mongoose");
const { Schema } = mongoose;

let categorySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  image: { data: Buffer, contentType: String },
  password: { type: String, required: true },
});

categorySchema.virtual("url").get(function () {
  return `/inventory/category/${this._id}`;
});

module.exports = mongoose.model("Category", categorySchema);
