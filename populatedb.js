#! /usr/bin/env node

console.log(
  "This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Category = require("./models/category");
var Item = require("./models/item");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var categories = [];
var items = [];

function categoryCreate(name, description, cb) {
  categorydetail = { name: name, description: description };

  var category = new Category(categorydetail);

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Author: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(name, description, price, numberinstock, category, cb) {
  var item = new Item({
    name: name,
    description: description,
    price: price,
    numberinstock: numberinstock,
    category: category,
  });

  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate(
          "Bread",
          "Bread, baked food product made of flour or meal that is moistened, kneaded, and sometimes fermented. A major food since prehistoric times, it has been made in various forms using a variety of ingredients and methods throughout the world.",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Cake",
          "A cake is a sweet food made by baking a mixture of flour, eggs, sugar, and fat in an oven.",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Bun",
          "A bun is a type of bread roll, typically filled with savory fillings (for example hamburger). A bun may also refer to a sweet cake in certain parts of the world. Though they come in many shapes and sizes, buns are most commonly round, and are generally hand-sized or smaller.",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Pasteries",
          "pastry, stiff dough made from flour, salt, a relatively high proportion of fat, and a small proportion of liquid. It may also contain sugar or flavourings. Most pastry is leavened only by the action of steam, but Danish pastry is raised with yeast.",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Biscuits",
          "A biscuit is a flour-based baked and shaped food product. In most countries biscuits are typically hard, flat, and unleavened. They are usually sweet and may be made with sugar, chocolate, icing, jam, ginger, or cinnamon.",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Cookies",
          "A cookie is a baked or cooked snack or dessert that is typically small, flat and sweet. It usually contains flour, sugar, egg, and some type of oil, fat, or butter. It may include other ingredients such as raisins, oats, chocolate chips, nuts, etc.",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Doughnuts",
          "Doughnuts are a kind of ring-shaped snack food popular in many countries, which are usually deep fried from flour doughs. After being fried, doughnuts can be spread with chocolate or icing on top, covered with powdered sugar or fruit, or glazed with sugar icing.",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Crackers",
          "A cracker is a flat, dry baked food typically made with flour. Flavorings or seasonings, such as salt, herbs, seeds, or cheese, may be added to the dough or sprinkled on top before baking. Crackers are often branded as a nutritious and convenient way to consume a staple food or cereal grain.",
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createItems(cb) {
  async.parallel(
    [
      function (callback) {
        itemCreate(
          "Chocolate Mud Cake",
          "Dark moist chocolate fudge cake",
          400,
          10,
          categories[1],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Marbled Mud Cake",
          "White and dark chocolate mixed together for the best of both worlds",
          450,
          5,
          categories[1],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Red Velvet Cake",
          "A deluxe creation featuring wonderfully moist red velvet cake. so so smooth. Smothered in a delicious cream cheese icing",
          500,
          7,
          categories[1],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Caraway Rye",
          "High in fiber and filled with caraway seeds. This part rye flour part wheat flour bread is perfect for Reubens",
          90,
          7,
          categories[0],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Kalamatta Batard",
          "A saturday special this organic loaf is spiked with kalamatta olives that are sure to make your mouth water",
          120,
          20,
          categories[0],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Fruit Bun",
          "A sweet roll made with fruit, fruit peel, spices and sometimes nuts",
          50,
          40,
          categories[2],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Iced Bun",
          "A bread roll that is made to a sweet recipe with an icing sugar glaze covering the top",
          70,
          15,
          categories[2],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Cronut",
          "A croissant-doughnut pastry attributed to New York City.",
          100,
          20,
          categories[3],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Gujiya",
          "A traditional Indian pastry, typically prepared by filling a round, flat pastry with a sweet filling made of dried fruits, grated coconut and condensed milk solids. It is usually fried in ghee, and sometimes soaked in sugar syrup. It is popular in the northern part of India during the festival of Holi.",
          60,
          40,
          categories[3],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Scones",
          "Scones are sweet, rich wedge-shaped biscuits that are usually made with cream as well as butter. Scones have a tender, heavy crumb and a slightly crusty brown top.",
          10,
          120,
          categories[4],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Short Cakes",
          "Shortcakes use rich biscuits or scones as a base. They are either split or served whole, topped with sweetened fruit and whipped cream or ice cream.",
          35,
          100,
          categories[4],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Chocolate Chip Cookies",
          "Loaded with pieces of Chocolates these cookies are drop cookies that can be soft and doughy or crisp and crunchy depending on how long you cook them or what ingredients you use.",
          45,
          55,
          categories[5],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Gingersnaps",
          "Also known as ginger nuts or ginger biscuits, these spicy treats are popular all around the world. Powdered ginger, cinnamon, molasses, and nutmeg make this popular holiday cookie the perfect blend of sweet and spicy.",
          20,
          50,
          categories[5],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Sugar Doughnuts",
          "Sugar donuts are a classic breakfast option. Their simple, sweet flavor is perfect for those who want something delicious to start their day off on the right foot. Sugar donuts are topped with a thin layer of sugar. This gives them a beautiful appearance and adds just enough sweetness without being overpowering or cloying.",
          85,
          75,
          categories[6],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Chocolate Sprinkles",
          "As the name suggests, a chocolate sprinkle donut has been topped with chocolate icing and sprinkles, making it one of the most popular types. They are loved by kids around the world.",
          21,
          70,
          categories[6],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Chesse Cracker",
          "The cheese cracker is a type of cracker prepared using cheese as a main ingredient. Additional common cracker ingredients are typically used, such as grain, flour, shortening, leavening, salt and various seasonings. The ingredients are formed into a dough, and the individual crackers are then prepared.",
          125,
          20,
          categories[7],
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Database created and items added successfully");
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
