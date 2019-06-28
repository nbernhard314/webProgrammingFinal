const express = require("express");
const router = express.Router();
const data = require("../data");
const users = data.users;
const products = data.products;

router.get("/", (req, res) => {});

router.post("/", async (req, res) => {});

router.get("/login", async (req, res) => {});

const constructorMethod = app => {
  app.use("/", router);

  app.use("*", (req, res) => {
    res.redirect("/");
  });
};

module.exports = constructorMethod;
