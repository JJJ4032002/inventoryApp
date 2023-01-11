const mongoose = require("mongoose");
const { Schema } = mongoose;

let itemSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, min: [1, "Price cannot be 0"] },
  numberinstock: { type: Number, min: [0, "Items cannot be negative"] },
  category: { ref: "Category", type: Schema.Types.ObjectId },
  image: { data: Buffer, contentType: String },
});

itemSchema.virtual("url").get(function () {
  return `/inventory/item/${this._id}`;
});

module.exports = mongoose.model("Item", itemSchema);
