if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // or import 'dotenv/config' if you're using ES6
}
const app = require("./src/app.js");
const ConnectDb = require("./src/config/db.js");
ConnectDb();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
