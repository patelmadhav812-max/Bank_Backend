const mongoose = require("mongoose");

ConnectDB()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

async function ConnectDB() {
  await mongoose.connect(process.env.MONOG_URL);
}

module.exports = ConnectDB;
