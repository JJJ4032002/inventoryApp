const categoryModel = require("../models/category");
const itemModel = require("../models/item");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
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
      categories_list.forEach((category) => {
        if (category.image.data) {
          category.image.data = category.image.data.toString("base64");
        }
      });
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
      if (results.CategoryDetails.image.data) {
        results.CategoryDetails.image.data =
          results.CategoryDetails.image.data.toString("base64");
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
    .isAlphanumeric("en-US", { ignore: " " })
    .withMessage("Category Name should not be alphanumeric"),
  body("description")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Description must not be empty"),
  body("categoryPassword")
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum of 8 letters"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create a category",
        category: req.body,
        errors: errors.array(),
      });
      return;
    }
    let newCategory;
    if (req.file === undefined) {
      newCategory = new categoryModel({
        name: req.body.name,
        description: req.body.description,
        password: req.body.categoryPassword,
      });
    } else {
      newCategory = new categoryModel({
        name: req.body.name,
        description: req.body.description,
        image: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
        password: req.body.categoryPassword,
      });
    }

    newCategory.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(newCategory.url);
    });
  },
];

exports.CategoryDeleteGet = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        categoryModel.findById(req.params.ID).exec((err, category) => {
          if (err) {
            return next(err);
          }
          callback(null, category);
        });
      },
      categoryItems: function (callback) {
        itemModel.find({ category: req.params.ID }).exec((err, items) => {
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
      if (results.category === null) {
        res.redirect("/inventory/categories");
        return;
      }
      if (results.categoryItems.length === 0) {
        res.render("category_delete", { category: results.category });
        return;
      }
      res.render("category_delete", {
        category: results.category,
        items: results.categoryItems,
      });
    }
  );
};

exports.CategoryDeletePost = [
  body("categoryPassword")
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum of 8 letters"),
  function (req, res, next) {
    const errors = validationResult(req);
    categoryModel.findById(req.body.categoryid).exec((err, category) => {
      if (err) {
        return next(err);
      }
      if (
        req.body.categoryPassword !== category.password ||
        !errors.isEmpty()
      ) {
        itemModel.find({ category: req.body.categoryid }).exec((err, items) => {
          if (err) {
            return next(err);
          }
          if (category === null) {
            res.redirect("/inventory/categories");
            return;
          }
          if (items.length === 0) {
            console.log(errors.array());
            res.render("category_delete", {
              category: category,
              errors:
                req.body.categoryPassword !== category.password
                  ? [{ msg: "Password does not match" }, ...errors.array()]
                  : errors.array(),
            });
            return;
          }
          res.render("category_delete", {
            category: category,
            items: items,
            errors:
              req.body.categoryPassword !== category.password
                ? [{ msg: "Password does not match" }, ...errors.array()]
                : errors.array(),
          });
        });
      } else {
        categoryModel
          .findByIdAndRemove(req.body.categoryid)
          .exec((err, category) => {
            if (err) {
              return next(err);
            }
            res.redirect("/inventory/categories");
          });
      }
    });
  },
];

exports.CategoryUpdateGet = function (req, res, next) {
  categoryModel.findById(req.params.ID).exec((err, category) => {
    if (err) {
      return next(err);
    }
    if (category === null) {
      res.redirect("/inventory/categories");
      return;
    }
    if (category.image.data) {
      category.image.data = category.image.data.toString("base64");
      res.render("category_form", {
        title: "Update category",
        category: category,
        image: { ...category.image },
      });
    } else {
      res.render("category_form", {
        title: "Update category",
        category: category,
      });
    }
  });
};

exports.CategoryUpdatePost = [
  body("name")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Category Name must be specified")
    .isAlphanumeric("en-US", { ignore: " " })
    .withMessage("Category Name should not be alphanumeric"),
  body("description")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Description must not be empty"),
  body("categoryPassword")
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum of 8 letters"),
  function (req, res, next) {
    const errors = validationResult(req);
    categoryModel.findById(req.params.ID).exec((err, category) => {
      if (err) {
        return next(err);
      }
      if (
        !errors.isEmpty() ||
        req.body.categoryPassword !== category.password
      ) {
        if (category.image.data) {
          category.image.data = category.image.data.toString("base64");
          res.render("category_form", {
            title: "Update a category",
            category: req.body,
            image: { ...category.image },
            errors:
              req.body.categoryPassword !== category.password
                ? [{ msg: "Password does not match" }, ...errors.array()]
                : errors.array(),
          });
        } else {
          res.render("category_form", {
            title: "Update a category",
            category: req.body,
            errors:
              req.body.categoryPassword !== category.password
                ? [{ msg: "Password does not match" }, ...errors.array()]
                : errors.array(),
          });
        }
        return;
      }
      let newCategory;
      if (req.file === undefined) {
        newCategory = category.image.data
          ? new categoryModel({
              name: req.body.name,
              description: req.body.description,
              image: {
                data: category.image.data,
                contentType: category.image.contentType,
              },
              _id: req.params.ID,
            })
          : new categoryModel({
              name: req.body.name,
              description: req.body.description,
              _id: req.params.ID,
            });
      } else {
        newCategory = new categoryModel({
          name: req.body.name,
          description: req.body.description,
          image: {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          },
          _id: req.params.ID,
        });
      }

      categoryModel.findByIdAndUpdate(
        req.params.ID,
        newCategory,
        {},
        function (err, category) {
          if (err) {
            return next(err);
          }
          res.redirect(category.url);
        }
      );
    });
  },
];
