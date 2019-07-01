const express = require("express");
const router = express.Router();
const data = require("../data");
const users = data.users;
const products = data.products;

//Add authenticated sessions with format {"sessionID":"username"}
let authenticatedSessions = {};

router.get("/", (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
    res.render("main/home", {});
  } else {
    res.render("main/home", {
      username: authenticatedSessions[req.session.id]
    });
  }
});

router.get("/login", (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
    res.render("auth/login", {});
  } else {
    res.redirect("/");
  }
});

router.post("/login", async (req, res) => {
  const username = req.body.username.toLowerCase();
  const password = req.body.password;
  if (!username || !password) {
    res.status(401).render("auth/login", {
      error: "Must provide a username and password."
    });
    return;
  }
  try {
    if (await users.checkLogin(username, password)) {
      authenticatedSessions[req.session.id] = username;
      res.redirect("/");
      console.log("login success");
      return;
    }
  } catch {
    res
      .status(401)
      .render("auth/login", { error: "Invalid user name or password" });
    return;
  }
});

router.get("/logout", (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
    res.redirect("/");
  } else {
    delete authenticatedSessions[req.session.id];
    req.session.destroy();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() - 1);
    res.cookie("AuthCookie", { expires: expiresAt });
    res.redirect("/");
  }
});

router.get("/product/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const product = await products.getByID(id);
    if (authenticatedSessions[req.session.id] == undefined) {
      res.render("main/product", {
        product: product,
        authenticated: false,
        itemName: product.itemName,
        description: product.description,
        price: product.price,
        imagePath: product.imagePath
      });
    } else {
      res.render("main/product", {
        product: product,
        authenticated: true,
        itemName: product.itemName,
        description: product.description,
        price: product.price,
        imagePath: product.imagePath
      });
    }
  } catch (e) {
    res.render("main/error", { error: e });
  }
});

router.post("/product/:id", async (req, res) => {
  //This post is to add product to cart. The add to cart button should only
  //be visible to logged in users.
  const productID = req.params.id;
  if (authenticatedSessions[req.session.id] == undefined) {
    res.render("main/error", { error: "No user logged in" });
  } else {
    try {
      username = authenticatedSessions[req.session.id];
      userID = users.getByUsername(username)._id;
      updatedUser = users.addToCart(userID, productID);
      res.render("main/cart", { user: updatedUser });
    } catch (e) {
      res.render("main/error", { error: e });
    }
  }
});

router.get("/signup", (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
    res.render("main/error", { error: "cannot be signed in and sign up." });
  } else {
    res.render("auth/signup", {});
  }
});

router.post("/signup", (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
    res.render("main/error", { error: "cannot be signed in and sign up." });
  } else {
    //TODO: use client side JS to make sure fields are filled in properly.
    const newUser = {
      username: req.body.username.toLowerCase(),
      password: req.body.password,
      email: req.body.email,
      address: req.body.address,
      address2: req.body.address2,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      city: req.body.city,
      zip: req.body.zip
    };
    try {
      let user = users.createUser(newUser);
      res.redirect("/login", {
        message: `user ${user.username} created successfully.`
      });
    } catch (e) {
      res.render("auth/signup", { error: e });
    }
  }
});

const constructorMethod = app => {
  app.use("/", router);

  app.use("*", (req, res) => {
    res.redirect("/");
  });
};

module.exports = constructorMethod;
