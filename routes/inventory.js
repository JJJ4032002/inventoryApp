var express = require("express");
var router = express.Router();
const itemController = require("../controllers/itemController");
const categoryController = require("../controllers/categoryController");
//Directs to the index page
router.get("/", itemController.index);
//Directs to the page which displays all the categories
router.get("/categories", categoryController.Categories);
//Directs to the page which displays all the items
router.get("/items", itemController.Items);
//Directs to the new item form page
router.get("/item/new", itemController.ItemFormGet);
//Add a new Item
router.post("/item/new", itemController.ItemFormPost);
//Directs to the page which displays individual item details
router.get("/item/:ID", itemController.ItemDetails);
//Directs to item update page
router.get("/item/:ID/update", itemController.ItemUpdateGet);
//Updates an item
router.post("/item/:ID/update", itemController.ItemUpdatePost);
// Directs to the delete page of item.
router.get("/item/:ID/delete", itemController.ItemDeleteGet);
//Deletes the item
router.post("/item/:ID/delete", itemController.ItemDeletePost);
//Directs to the update category page
router.get("/category/:ID/update", categoryController.CategoryUpdateGet);
//updates the category
router.post("/category/:ID/update", categoryController.CategoryUpdatePost);
//Directs to the delete page of the category
router.get("/category/:ID/delete", categoryController.CategoryDeleteGet);
//Deletes the category
router.post("/category/:ID/delete", categoryController.CategoryDeletePost);
//Direct to the create category form page
router.get("/category/new", categoryController.CategoryFormGet);
// Add the new category
router.post("/category/new", categoryController.CategoryFormPost);
//Directs to the page which displays individual Category details
router.get("/category/:ID", categoryController.CategoryDetails);

module.exports = router;
