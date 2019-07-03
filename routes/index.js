const express = require("express");
const router = express.Router();
const data = require("../data");
const users = data.users;
const products = data.products;

//Add authenticated sessions with format {"sessionID":"username"}
let authenticatedSessions = {};

router.get("/", (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
    res.render("main/home", { authenticated: false });
  } else {
    res.render("main/home", { authenticated: true });
  }
});

router.get("/login", (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
    res.render("auth/login", { authenticated: false });
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
    res.render("main/product", {
      review: product.reviews.map(review => {
        return {
          title: review.title,
          rating: review.rating,
          comment: review.comment,
          postedBy: review.postedBy
        };
      }),
      product: product,
      authenticated: authenticatedSessions[req.session.id] != undefined,
      itemName: product.itemName,
      description: product.description,
      price: product.price,
      imagePath: product.imagePath
    });
  } catch (e) {
    res.render("main/error", { error: e });
  }
});

router.post("/product/:id", async (req, res) => {
  const productID = req.params.id;
  if (authenticatedSessions[req.session.id] == undefined) {
    res.render("main/error", { error: "No user logged in" });
  } else {
    if (!Object.keys(req.body).length) {
      //this means the POST is add to cart
      try {
        const username = authenticatedSessions[req.session.id];
        const user = await users.getByUsername(username);
        updatedUser = users.addToCart(user._id, productID);
        res.redirect("/cart");
      } catch (e) {
        res.render("main/error", { error: e });
      }
    } else {
      //this means POST is add review
      //TODO: use client side JS to make sure fields are filled in properly.
      try {
        const newReview = {
          title: req.body.title,
          rating: req.body.rating,
          comment: req.body.comment,
          postedBy: authenticatedSessions[req.session.id]
        };
        await products.addReview(productID, newReview);
        res.redirect("back");
      } catch (e) {
        res.render("main/error", { error: e });
      }
    }
  }
});

router.get("/cart", async (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
    res.redirect("/login");
  } else {
    try {
      const user = await users.getByUsername(
        authenticatedSessions[req.session.id]
      );
      const cart = user.cart;
      const items = [];
      let totalPrice = 0;
      for (let i = 0; i < cart.length; i++) {
        let p = await products.getByID(cart[i]);
        items.push(p);
        totalPrice += parseFloat(p.price);
      }
      res.render("main/cart", {
        item: items.map(item => {
          return {
            itemName: item.itemName,
            price: item.price,
            id: item._id
          };
        }),
        notEmpty: cart.length != 0,
        totalPrice: totalPrice,
        authenticated: true
      });
    } catch (e) {
      res.render("/cart", { error: e });
    }
  }
});

router.post("/cart", async (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
    res.redirect("/login");
  } else {
    try {
      const user = await users.getByUsername(
        authenticatedSessions[req.session.id]
      );
      await users.clearCart(user._id);
      res.redirect("/cart");
    } catch (e) {
      res.render("main/cart", { error: e });
    }
  }
});

router.get("/signup", (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
    res.render("auth/signup", {});
  } else {
    res.redirect("/");
  }
});

router.get("/all", async (req, res) => {
  const allProducts = await products.getAllProducts();
  res.render("main/all", {
    item: allProducts.map(item => {
      return {
        itemName: item.itemName,
        price: item.price,
        id: item._id,
        imagePath: item.imagePath
      };
    }),
    notEmpty: allProducts.length != 0,
    authenticated: authenticatedSessions[req.session.id] != undefined
  });
});

router.post("/signup", async (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
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
      let user = await users.createUser(newUser);
      res.redirect("/login");
    } catch (e) {
      res.render("auth/signup", { error: e });
    }
  } else {
    //TODO: use client side JS to make sure fields are filled in properly.
    res.render("main/error", { error: "cannot sign up when logged in." });
  }
});

const constructorMethod = app => {
  app.use("/", router);

  app.use("*", (req, res) => {
    res.redirect("/");
  });
};

module.exports = constructorMethod;
