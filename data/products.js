const mongoCollections = require("./mongoCollections");
const products = mongoCollections.products;
const mongo = require("mongodb");

let exportedFunctions = {
  async createProduct(prodObj) {
    if (!prodObj) throw "Must provide a user object";
    if (
      typeof prodObj.itemName != "string" ||
      typeof prodObj.description != "string" ||
      typeof prodObj.price != "string" ||
      typeof prodObj.imagePath != "string" ||
      !prodObj.peopleAlsoBought instanceof Array ||
      !prodObj.reviews instanceof Array
    ) {
      throw TypeError("Wrong type provided");
    }
    if (prodObj.reviews.length > 0) {
      if (
        typeof prodObj.reviews[0]["title"] != "string" ||
        typeof prodObj.reviews[0]["rating"] != "string" ||
        typeof prodObj.reviews[0]["postedBy"] != "string" ||
        typeof prodObj.reviews[0]["comment"] != "string"
      ) {
        throw "Wrong type provided for review";
      }
    }
    let newProduct = {
      itemName: prodObj.itemName,
      description: prodObj.description,
      price: prodObj.price,
      imagePath: prodObj.imagePath,
      peopleAlsoBought: prodObj.peopleAlsoBought,
      reviews: prodObj.reviews
    };

    const allProducts = await products();
    const insertInfo = await allProducts.insertOne(newProduct);
    if (insertInfo.insertedCount === 0) throw "Could not add product";

    const newId = insertInfo.insertedId;
    return await this.getByID(newId);
  },

  async getByID(id) {
    if (!id) {
      throw "Must provide ID ";
    }
    let objID = mongo.ObjectID(id);
    const allProducts = await products();
    const result = await allProducts.findOne({ _id: objID });
    if (result === null) throw "No product with that id";
    return result;
  },

  async getByTitle(title) {
    if (typeof title != "string") {
      throw "Must provide username ";
    }
    const allProducts = await products();
    const result = await allProducts.findOne({ title: title });
    if (result === null) throw "No product with that title";
    return result;
  },

  async addReview(id, reviewObj) {
    if (!id) {
      throw "must provide ID";
    }
    if (
      typeof reviewObj["title"] != "string" ||
      typeof reviewObj["rating"] != "string" ||
      typeof reviewObj["postedBy"] != "string" ||
      typeof reviewObj["comment"] != "string"
    ) {
      throw "Wrong type provided for review";
    }
    let objID = mongo.ObjectID(id);
    let product = await this.getByID(objID);
    let newReviews = product.reviews;
    newReviews.push(reviewObj);
    let newProduct = {
      reviews: newReviews
    };
    const allProducts = await products();
    const updateRet = await allProducts.updateOne(
      { _id: product._id },
      { $set: newProduct }
    );
    if (updateRet.modifiedCount === 0) {
      throw "could not update cart successfully";
    }
    return await this.getByID(id);
  },

  async search(searchTerm) {
    if (typeof searchTerm != "string") {
      throw "serach must be string";
    }
    let regex = new RegExp([".*", searchTerm, ".*"].join(""), "i");
    const allProducts = await products();
    const list = await allProducts
      .find({
        $or: [{ title: regex }, { description: regex }]
      })
      .toArray();
    return list;
  },

  async deleteUser(id) {
    if (!id) {
      throw "Must provide ID ";
    }
    let objID = mongo.ObjectID(id);
    const allProducts = await products();
    const deletionInfo = await allProducts.removeOne({ _id: objID });
    if (deletionInfo.deletedCount === 0) {
      throw `Could not delete animal with id of ${id}`;
    }
    return true;
  }
};

module.exports = exportedFunctions;
