const categoryModel = require("../models/category");
const itemModel = require("../models/item");
const async = require("async");
const { body, validationResult } = require("express-validator");
exports.Categories = function (req, res, next) {
  categoryModel
    .find({})
    .sort("name")
    .exec(function (err, categories_list) {
      if (err) {
        return next(err);
      }
      res.render("categories_list", {
        title: "Select your Category",
        categories_list: categories_list,
      });
    });
};

exports.CategoryDetails = function (req, res, next) {
  async.parallel(
    {
      CategoryDetails: function (callback) {
        categoryModel.findById(req.params.ID).exec(function (err, category) {
          if (err) {
            return next(err);
          }
          callback(null, category);
        });
      },
      CategoryItems: function (callback) {
        itemModel.find({ category: req.params.ID }).exec(function (err, items) {
          if (err) {
            return next(err);
          }
          callback(null, items);
        });
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.CategoryDetails === undefined) {
        res.redirect("/inventory/categories");
      }
      res.render("category_details", {
        category: results.CategoryDetails,
        categoryItems: results.CategoryItems,
      });
    }
  );
};

exports.CategoryFormGet = function (req, res, next) {
  res.render("category_form", { title: "Create a category" });
};

exports.CategoryFormPost = [
  body("name")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Category Name must be specified")
    .isAlphanumeric()
    .withMessage("Category Name should not be alphanumeric"),
  body("description")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Description must not be empty"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(req.body);
      res.render("category_form", {
        title: "Create a category",
        category: req.body,
        errors: errors.array(),
      });
      return;
    }

    const newCategory = new categoryModel({
      name: req.body.name,
      description: req.body.description,
    });
    newCategory.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(newCategory.url);
    });
  },
];