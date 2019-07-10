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

    let nyc = await products.createProduct({
      itemName: "Empire State Building",
      description: "Its pretty tall",
      imagePath: "../../public/images/empire.jpg",
      price: "100",
      peopleAlsoBought: []
    });
    let streetDog = await products.createProduct({
      itemName: "Authentic NYC Street Hotdog",
      description: "Street Meat!",
      imagePath: "../../public/images/hotdog.jpg",
      price: "1",
      peopleAlsoBought: []
    });

    let naps = await products.createProduct({
      itemName: "Napoli's",
      description: "Good Pizza on Washington",
      imagePath: "../../public/images/pizza.jpg",
      price: "10",
      peopleAlsoBought: []
    });

    await products.addReview(naps._id, {
      title: "Best Pizza",
      rating: "5",
      comment: "Have the vodka slice",
      postedBy: "adam"
    });
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
    let magicKingdom = await products.createProduct({
      itemName: "Magic Kingdom",
      description: "Very magical.",
      imagePath: "../../public/images/magickingdom.jpg",
      price: "200",
      peopleAlsoBought: []
    });
    let epcot = await products.createProduct({
      itemName: "Epcot",
      description: "Travel around the world in just a few hours!",
      imagePath: "../../public/images/epcot.png",
      price: "200",
      peopleAlsoBought: []
    });
    let animalKingdom = await products.createProduct({
      itemName: "Animal Kingdom",
      description: "Lots of animals to see!",
      imagePath: "../../public/images/animalkingdom.png",
      price: "200",
      peopleAlsoBought: []
    });
    let hollyWoodStudios = await products.createProduct({
      itemName: "Hollywood Studios",
      description: "Knockoff Universal Studios!",
      imagePath: "../../public/images/hollywoodstudios.png",
      price: "200",
      peopleAlsoBought: []
    });
    console.log("Seed complete.");
  } catch (e) {
    console.log("Error: " + e);
  }

  process.exit(0);
}

run();
