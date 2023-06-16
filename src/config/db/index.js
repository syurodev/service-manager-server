const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

// https://service-manager-server.herokuapp.com/

async function connect() {
  try {
    // await mongoose.connect("mongodb://127.0.0.1:27017/service-manager");
    await mongoose.connect("mongodb+srv://syurodev:Vv19082001@cluster0.czuhqxo.mongodb.net/service-manager?retryWrites=true&w=majority");
    console.log("Connect Successfully!!!");
  } catch (error) {
    console.log("Connect Failure", error);
  }
}

module.exports = { connect };