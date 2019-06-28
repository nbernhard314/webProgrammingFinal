const mongoCollections = require("./mongoCollections");
const users = mongoCollections.users;
const bcrypt = require("bcryptjs");
const saltRounds = 16;
const mongo = require("mongodb");

let exportFunctions = {
  async createUser(userObj) {
    if (!userObj) throw "Must provide a user object";
    if (
      typeof userObj.username != "string" ||
      typeof userObj.firstName != "string" ||
      typeof userObj.lastName != "string" ||
      typeof userObj.email != "string" ||
      typeof userObj.address != "string" ||
      typeof userObj.address2 != "string" ||
      typeof userObj.city != "string" ||
      typeof userObj.zip != "string" ||
      typeof userObj.password != "string"
    ) {
      throw TypeError("Wrong type provided");
    }
    const hashedPw = await bcrypt.hash(userObj.password, saltRounds);
    let newUser = {
      username: userObj.username,
      firstName: userObj.firstName,
      lastName: userObj.lastName,
      email: userObj.email,
      address: userObj.address,
      address2: userObj.address2,
      city: userObj.city,
      zip: userObj.zip,
      password: hashedPw,
      cart: []
    };

    const allUsers = await users();
    const insertInfo = await allUsers.insertOne(newUser);
    if (insertInfo.insertedCount === 0) throw "Could not add user";

    const newId = insertInfo.insertedId;
    return await this.getByID(newId);
  },

  async getByID(id) {
    if (typeof id != "string") {
      throw "Must provide ID ";
    }
    let objID = mongo.ObjectID(id);
    const allUsers = await users();
    const result = await allUsers.findOne({ _id: objID });
    if (result === null) throw "No user with that id";
    return result;
  },

  async getByUsername(username) {
    if (typeof username != "string") {
      throw "Must provide username ";
    }
    const allUsers = await users();
    const result = await allUsers.findOne({ username: username });
    if (result === null) throw "No user with that id";
    return result;
  },

  async deleteUser(id) {
    if (typeof id != "string") {
      throw "Must provide ID ";
    }
    let objID = mongo.ObjectID(id);
    const allUsers = await users();
    const deletionInfo = await allUsers.removeOne({ _id: objID });
    if (deletionInfo.deletedCount === 0) {
      throw `Could not delete animal with id of ${id}`;
    }
    return true;
  },

  async updateUser(id, userObj) {
    if (typeof id != "string" || !userObj) {
      throw "Must provide ID and user object";
    }
    let newUser = {};
    let hasFields = false;
    if (userObj["username"] && typeof userObj["username"] == "string") {
      newUser["username"] = userObj["username"];
      hasFields = true;
    }
    if (userObj["firstName"] && typeof userObj["firstName"] == "string") {
      newUser["firstName"] = userObj["firstName"];
      hasFields = true;
    }
    if (userObj["lastName"] && typeof userObj["lastName"] == "string") {
      newUser["lastName"] = userObj["lastName"];
      hasFields = true;
    }
    if (userObj["address"] && typeof userObj["address"] == "string") {
      newUser["address"] = userObj["address"];
      hasFields = true;
    }
    if (userObj["address2"] && typeof userObj["address2"] == "string") {
      newUser["address2"] = userObj["address2"];
      hasFields = true;
    }
    if (userObj["city"] && typeof userObj["city"] == "string") {
      newUser["city"] = userObj["city"];
      hasFields = true;
    }
    if (userObj["zip"] && typeof userObj["zip"] == "string") {
      newUser["zip"] = userObj["zip"];
      hasFields = true;
    }
    if (userObj["email"] && typeof userObj["email"] == "string") {
      newUser["email"] = userObj["email"];
      hasFields = true;
    }
    if (userObj["password"] && typeof userObj["password"] == "string") {
      newUser["password"] = await bcrypt.hash(userObj["password"], saltRounds);
      hasFields = true;
    }
    if (userObj["cart"] && userObj["cart"] instanceof Array) {
      newUser["cart"] = userObj["cart"];
      hasFields = true;
    }
    if (!hasFields) {
      throw "Updated User object has no required fields";
    }
    let objID = mongo.ObjectID(id);
    const allUsers = await users();
    const updateRet = await allUsers.updateOne(
      { _id: objID },
      { $set: newUser } // Must use this $set command to update
    );
    if (updateRet.modifiedCount === 0) {
      throw "could not update user successfully";
    }
    return await this.getByID(objID);
  },

  async addToCart(id, productID) {
    let user = await this.getByID(id);
    let newCart = user.cart;
    newCart.push(productID);
    let newUser = {
      cart: newCart
    };
    const allUsers = await users();
    const updateRet = await allUsers.updateOne(
      { _id: user._id },
      { $set: newUser }
    );
    if (updateRet.modifiedCount === 0) {
      throw "could not update cart successfully";
    }
    return await this.getByID(objID);
  },
  async clearCart(id) {
    let user = await this.getByID(id);
    let newUser = {
      cart: []
    };
    const allUsers = await users();
    const updateRet = await allUsers.updateOne(
      { _id: user._id },
      { $set: newUser }
    );
    if (updateRet.modifiedCount === 0) {
      throw "could not update cart successfully";
    }
    return await this.getByID(objID);
  }
};

module.exports = exportFunctions;
