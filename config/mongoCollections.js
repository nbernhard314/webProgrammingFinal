const dbConnection = require("./mongoConnection");

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
const getCollectionFn = collection => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

async function clearCollections() {
  try {
    // We can recover from this; if it can't drop the collection, it's because
    const db = await dbConnection();
    await db.collection("Users").drop();
    await db.collection("Products").drop();
    await db.collection("Coupons").drop();
  } catch (e) {
    console.log(e);
  }
}

/* Now, you can list your collections here: */
module.exports = {
  users: getCollectionFn("Users"),
  products: getCollectionFn("Products"),
  coupons: getCollectionFn("Coupons"),
  clearCollections
};
