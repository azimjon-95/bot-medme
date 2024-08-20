const { connect } = require("mongoose");
require("dotenv").config();

async function connectToDb() {
    // set("strictQuery", false);
    await connect(process.env.MONGO_URL)
        .then(() => console.log("MongoDB is connected"))
        .catch((err) => console.log("MongoDB is not connected", err));
}

connectToDb();
require('./controllers/botCtrl')


