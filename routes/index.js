const express = require("express");
const router = express.Router();
const data = require("../data");
const users = data.users;
const products = data.products;
const coupons = data.coupons;
const xss = require("xss");

//Add authenticated sessions with format {"sessionID":"username"}
let authenticatedSessions = {};

router.get("/", (req, res) => {
  if (authenticatedSessions[req.session.id] == undefined) {
    res.render("main/home", { authenticated: false });
  } else {
    res.render("main/home", { authenticated: true });
  }
});

router.post("/", async (req, res) => {
  const searchTerm = xss(req.body.search.trim());
  if (!searchTerm) {
    res.status(401).render("main/home", {
      error: "Must provide search term."
    });
    return;
  }
  try {
    //TODO: Need to fix this, search function is not working.
    const results = await products.search(searchTerm);
    if (results.length == 0) {
      res.render("main/home", {
        error: "No results found."
      });
    } else {
      res.render("main/home", {
        results: results,
        result: results.map(result => {
          return {
            itemName: result.itemName,
            id: result._id
          };
        })
      });
    }
  } catch (e) {
    res.render("main/home", {
      error: e
    });
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
  const username = xss(req.body.username.toLowerCase().trim());
  const password = xss(req.body.password);
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
  } catch (e) {
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
      try {
        const newReview = {
          title: xss(req.body.title.trim()),
          rating: xss(req.body.rating.trim()),
          comment: xss(req.body.comment.trim()),
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

router.post("/coupon", async (req, res) => {
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
      for (let c in cart) {
        let p = await products.getByID(c);
        items.push(p);
        totalPrice += parseFloat(p.price) * parseFloat(cart[c]);
      }
      const coup = await coupons.getByCode(xss(req.body.code));
      const save = coup.savings;
      const newTotal = totalPrice - save > 0 ? totalPrice - save : 0;
      res.render("main/cart", {
        item: items.map(item => {
          return {
            itemName: item.itemName,
            price: item.price,
            id: item._id,
            quantity: cart[item._id]
          };
        }),
        notEmpty: Object.keys(cart).length != 0,
        totalPrice: newTotal,
        authenticated: true
      });
    } catch (e) {
      res.redirect("/cart");
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
      for (let c in cart) {
        if (parseFloat(cart[c]) > 0) {
          let p = await products.getByID(c);
          items.push(p);
          totalPrice += parseFloat(p.price) * parseFloat(cart[c]);
        }
      }
      res.render("main/cart", {
        item: items.map(item => {
          return {
            itemName: item.itemName,
            price: item.price,
            id: item._id,
            quantity: cart[item._id]
          };
        }),
        notEmpty: Object.keys(cart).length != 0,
        totalPrice: totalPrice,
        authenticated: true
      });
    } catch (e) {
      res.render("main/cart", { error: e });
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
      if (!Object.keys(req.body).length) {
        await users.clearCart(user._id);
        res.redirect("/cart");
      } else {
        let obj = JSON.parse(JSON.stringify(req.body));
        await users.updateCart(user._id, obj);
        res.redirect("/cart");
      }
    } catch (e) {
      res.render("main/cart", { error: e });
    }
  }
});

//TODO: Implement update cart
router.put("/cart/:id", async (req, res) => {
  console.log(req.params.id);
  res.redirect("back");
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
      username: xss(req.body.username.toLowerCase().trim()),
      password: xss(req.body.password),
      email: xss(req.body.email.trim()),
      address: xss(req.body.address.trim()),
      address2: xss(req.body.address2.trim()),
      firstName: xss(req.body.firstName.trim()),
      lastName: xss(req.body.lastName.trim()),
      city: xss(req.body.city.trim()),
      zip: xss(req.body.zip)
    };
    try {
      let user = await users.createUser(newUser);
      res.redirect("/login");
    } catch (e) {
      res.render("auth/signup", { error: e });
    }
  } else {
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
