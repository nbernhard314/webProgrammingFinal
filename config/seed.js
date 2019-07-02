const data = require("../data");
const users = data.users;
const products = data.products;
const collections = require("./mongoCollections");
const dbConnection = require("./mongoConnection");

async function run() {
  collections.clearCollections();
  try {
    let adam = await users.createUser({
      username: "adam",
      firstName: "Adam",
      lastName: "Undus",
      address: "1 Castle Point",
      address2: "",
      city: "Hoboken",
      zip: "07030",
      email: "adam@mail.com",
      password: "password"
    });

    console.log(adam._id);

    let bagels = await products.createProduct({
      itemName: "Bagels on the Hudson",
      description: "Okayest bagels in town!",
      imagePath: "../public/images/bagels.png",
      price: "5",
      peopleAlsoBought: []
    });

    console.log(bagels._id);
  } catch (e) {
    console.log(e);
  }
  process.exit(0);
}

run();
