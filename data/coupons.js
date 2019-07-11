const mongoCollections = require("../config/mongoCollections");
const coupons = mongoCollections.coupons;
const mongo = require("mongodb");

let exportedFunctions = {
  async createCoupon(savings, code) {
    if (!savings || !code) throw "Must include savings and code";
    if (typeof savings !== "number") throw "Savings must be a positive integer";
    if (savings <= 0) throw "Savings must be a positive integer greater than 0";
    if (typeof code !== "string") throw "code must be of type string";

    let newCoupon = {
      savings: savings,
      code: code
    };

    const allCoupons = await coupons();
    const insertInfo = await allCoupons.insertOne(newCoupon);
    if (insertInfo.insertedCount === 0) throw "Could not add coupon";

    const newId = insertInfo.insertedId;
    return await this.getByID(newId);
  },

  async getAllCoupons() {
    const allCoupons = await coupons();
    const result = await allCoupons.find({}).toArray();
    return result;
  },

  async getByID(id) {
    if (!id) {
      throw "Must provide ID ";
    }
    let objID = mongo.ObjectID(id);
    const allCoupons = await coupons();
    const result = await allCoupons.findOne({ _id: objID });
    if (result === null) throw "No coupon with that id";
    return result;
  },

  async getByCode(code) {
    if (!code) throw "Must provide code ";
    if (typeof code !== "string") {
      throw "Code must be of type string";
    }
    const allCoupons = await coupons();
    const result = await allCoupons.findOne({ code: code });
    if (result === null) throw "Code entered is not a valid coupon";
    return result;
  },

  async deleteCoupon(id) {
    if (!id) {
      throw "Must provide ID ";
    }
    let objID = mongo.ObjectID(id);
    const allCoupons = await coupons();
    const deletionInfo = await allCoupons.removeOne({ _id: objID });
    if (deletionInfo.deletedCount === 0) {
      throw `Could not delete animal with id of ${id}`;
    }
    return true;
  }
};

module.exports = exportedFunctions;
