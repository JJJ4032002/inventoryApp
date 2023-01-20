const itemModel = require("../models/item");
const categoryModel = require("../models/category");
const async = require("async");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const fs = require("fs");
const path = require("node:path");
const { body, validationResult } = require("express-validator");
exports.index = function (req, res, next) {
  res.render("index");
};

exports.Items = function (req, res, next) {
  itemModel
    .find({})
    .sort("name")
    .exec(function (err, items_list) {
      if (err) {
        return next(err);
      }
      items_list.forEach((item) => {
        if (item.image.data) {
          item.image.data = item.image.data.toString("base64");
        }
      });
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
      if (item === undefined) {
        res.redirect("/inventory/items");
      }
      if (item.image.data) {
        item.image.data = item.image.data.toString("base64");
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
    .isAlphanumeric("en-US", { ignore: " " })
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
  body("numberinstock")
    .trim()
    .escape()
    .isFloat({ min: 0 })
    .withMessage("The number of items present in stock cannot be less than 0"),
  body("itemPassword")
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum of 8 letters"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      categoryModel.find({}).exec(function (err, categories) {
        if (err) {
          return next(err);
        }
        console.log(req.body);
        res.render("item_form", {
          title: "Create an Item",
          item: req.body,
          categories: categories,
          errors: errors.array(),
        });
      });
      return;
    }
    let newItem;
    if (req.file) {
      newItem = new itemModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        numberinstock: req.body.numberinstock,
        category: req.body.category,
        password: req.body.itemPassword,
        image: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
      });
    } else {
      newItem = new itemModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        numberinstock: req.body.numberinstock,
        category: req.body.category,
        password: req.body.itemPassword,
      });
    }

    newItem.save((err, results) => {
      if (err) {
        return next(err);
      }
      res.redirect(newItem.url);
    });
  },
];

exports.ItemDeleteGet = function (req, res, next) {
  itemModel.findById(req.params.ID).exec(function (err, item) {
    if (err) {
      return next(err);
    }
    res.render("item_delete", { item: item });
  });
};

exports.ItemDeletePost = [
  body("itemPassword")
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum of 8 letters"),
  function (req, res, next) {
    const errors = validationResult(req);
    itemModel.findById(req.params.ID).exec(function (err, item) {
      if (err) {
        return next(err);
      }
      if (req.body.itemPassword !== item.password || !errors.isEmpty()) {
        res.render("item_delete", {
          item: item,
          errors:
            req.body.itemPassword !== item.password
              ? [{ msg: "Password does not match" }, ...errors.array()]
              : errors.array(),
        });
      } else {
        itemModel.findByIdAndRemove(req.body.itemid).exec(function (err, item) {
          if (err) {
            return next(err);
          }
          res.redirect("/inventory/items");
        });
      }
    });
  },
];

exports.ItemUpdateGet = function (req, res, next) {
  async.parallel(
    {
      item: function (callback) {
        itemModel
          .findById(req.params.ID)
          .populate("category")
          .exec((err, item) => {
            if (err) {
              return next(err);
            }
            callback(null, item);
          });
      },
      categories: function (callback) {
        categoryModel.find({}).exec((err, categories) => {
          if (err) {
            return next(err);
          }
          callback(null, categories);
        });
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.item.image.data) {
        results.item.image.data = results.item.image.data.toString("base64");
        res.render("item_form", {
          title: "Update Item",
          item: results.item,
          categories: results.categories,
          image: { ...results.item.image },
        });
      } else {
        res.render("item_form", {
          title: "Update Item",
          item: results.item,
          categories: results.categories,
        });
      }
    }
  );
};

exports.ItemUpdatePost = [
  body("name")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Item Name must be specified")
    .isAlphanumeric("en-US", { ignore: " " })
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
  body("numberinstock")
    .trim()
    .escape()
    .isFloat({ min: 0 })
    .withMessage("The number of items present in stock cannot be less than 0"),
  body("itemPassword")
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password must be minimum of 8 letters"),
  function (req, res, next) {
    const errors = validationResult(req);
    itemModel.findById(req.params.ID).exec((err, item) => {
      if (err) {
        return next(err);
      }

      if (!errors.isEmpty() || req.body.itemPassword !== item.password) {
        let errorItem = new itemModel({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          numberinstock: req.body.numberinstock,
          category: req.body.category,
          password: item.password,
          _id: req.params.ID,
        });
        categoryModel.find({}).exec(function (err, categories) {
          if (err) {
            return next(err);
          }
          if (item.image.data) {
            item.image.data = item.image.data.toString("base64");
            res.render("item_form", {
              title: "Update Item",
              item: errorItem,
              categories: categories,
              image: { ...item.image },
              errors:
                req.body.itemPassword !== item.password
                  ? [{ msg: "Password does not match" }, ...errors.array()]
                  : errors.array(),
            });
          } else {
            res.render("item_form", {
              title: "Update Item",
              item: errorItem,
              categories: categories,
              errors:
                req.body.itemPassword !== item.password
                  ? [{ msg: "Password does not match" }, ...errors.array()]
                  : errors.array(),
            });
          }
        });
        return;
      }
      let newItem;
      if (req.file) {
        newItem = new itemModel({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          numberinstock: req.body.numberinstock,
          category: req.body.category,
          image: {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          },
          password: req.body.itemPassword,
          _id: req.params.ID,
        });
      } else {
        newItem = item.image.data
          ? new itemModel({
              name: req.body.name,
              description: req.body.description,
              price: req.body.price,
              numberinstock: req.body.numberinstock,
              category: req.body.category,
              password: req.body.itemPassword,
              image: {
                ...item.image,
              },
              _id: req.params.ID,
            })
          : new itemModel({
              name: req.body.name,
              description: req.body.description,
              price: req.body.price,
              numberinstock: req.body.numberinstock,
              category: req.body.category,
              password: req.body.itemPassword,
              _id: req.params.ID,
            });
      }

      itemModel.findByIdAndUpdate(
        req.params.ID,
        newItem,
        {},
        (err, updatedItem) => {
          if (err) {
            return next(err);
          }
          res.redirect(updatedItem.url);
        }
      );
    });
  },
];
