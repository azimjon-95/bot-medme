const { connect } = require("mongoose");
require("dotenv").config();
require("colors");

async function connectToDb() {
    // set("strictQuery", false);
    await connect(process.env.MONGO_URL)
        .then(() => console.log("MongoDB is connected".bgGreen.white))
        .catch((err) => console.log("MongoDB is not connected".bgRed.white, err));
}

connectToDb();
require('./controllers/botCtrl')


