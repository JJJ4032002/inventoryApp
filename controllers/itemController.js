const itemModel = require("../models/item");
const categoryModel = require("../models/category");
const async = require("async");
const { body, validationResult } = require("express-validator");
exports.index = function (req, res, next) {
  res.render("index", { title: "Cakery" });
};

exports.Items = function (req, res, next) {
  itemModel
    .find({})
    .sort("name")
    .exec(function (err, items_list) {
      if (err) {
        return next(err);
      }
      res.render("items_list", {
        title: "Select an Item",
        items_list: items_list,
      });
    });
};

exports.ItemDetails = function (req, res, next) {
  itemModel
    .findById(req.params.ID)
    .populate("category")
    .exec(function (err, item) {
      if (err) {
        return next(err);
      }
      console.log(item);
      if (item === undefined) {
        res.redirect("/inventory/items");
      }
      res.render("item_details", { item: item });
    });
};

exports.ItemFormGet = function (req, res, next) {
  categoryModel.find({}).exec(function (err, categories) {
    if (err) {
      return next(err);
    }
    if (categories.length === 0) {
      res.render("item_form", { title: "Create an Item", categories: [] });
      return;
    }
    res.render("item_form", {
      title: "Create an Item",
      categories: categories,
    });
  });
};

exports.ItemFormPost = [
  body("name")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Item Name must be specified")
    .isAlphanumeric()
    .withMessage("Item Name should not be alphanumeric"),
  body("description")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Description must not be empty"),
  body("price")
    .trim()
    .escape()
    .isFloat({ min: 1 })
    .withMessage("Price cannot be 0 for an item"),
  body("numberInStock")
    .trim()
    .escape()
    .isFloat({ min: 0 })
    .withMessage("The number of items present in stock cannot be less than 0"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      categoryModel.find({}).exec(function (err, categories) {
        res.render("item_form", {
          title: "Create an Item",
          item: req.body,
          categories: categories,
          errors: errors.array(),
        });
      });
      return;
    }
    let newItem = new itemModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      numberinstock: req.body.numberinstock,
      category: req.body.category,
    });
    newItem.save((err, results) => {
      if (err) {
        return next(err);
      }
      res.redirect(newItem.url);
    });
  },
];
