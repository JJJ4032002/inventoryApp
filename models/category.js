const mongoose = require("mongoose");
const { Schema } = mongoose;

let categorySchema = new Schema({
  name: { type: String, required: true },
  description: String,
});

categorySchema.virtual("url").get(function () {
  return `/inventory/category/${this._id}`;
});

module.exports = mongoose.model("Category", categorySchema);
