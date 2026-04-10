if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // or import 'dotenv/config' if you're using ES6
}
const app = require("./src/app.js");
const ConnectDb = require("./src/config/db.js");
ConnectDb();
app.listen(3000, () => {
  console.log("app is listing");
});
