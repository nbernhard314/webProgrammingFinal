const data = require("../data");
const users = data.users;
const products = data.products;
const collections = require("./mongoCollections");

async function run() {
  await collections.clearCollections();
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

    // console.log(adam._id);

    let bagels = await products.createProduct({
      itemName: "Bagels on the Hudson",
      description: "Okayest bagels in town!",
      imagePath: "../../public/images/bagels.png",
      price: "5",
      peopleAlsoBought: []
    });

    let naps = await products.createProduct({
      itemName: "Napoli's",
      description: "Good Pizza on Washington",
      imagePath: "../../public/images/pizza.jpg",
      price: "10",
      peopleAlsoBought: []
    });

    console.log(
      await products.addReview(naps._id, {
        title: "Best Pizza",
        rating: "5",
        comment: "Have the vodka slice",
        postedBy: "adam"
      })
    );
    let rachel = await users.createUser({
      username: "rcipkins",
      firstName: "Rachel",
      lastName: "Cipkins",
      address: "1 Castle Point",
      address2: "S-1234",
      city: "Hoboken",
      zip: "07030",
      email: "rachel@gotmail.net",
      password: "pass1234"
    });
    // console.log(bagels._id);
    // console.log(naps._id);
    console.log("seed complete");
  } catch (e) {
    console.log("Error: " + e);
  }

  process.exit(0);
}

run();
