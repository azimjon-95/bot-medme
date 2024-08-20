const express = require("express");
const { connect } = require("mongoose");
require("dotenv").config();
require("colors");

const app = express();
app.use(express.json());


async function connectToDb() {
    // set("strictQuery", false);
    await connect(process.env.MONGO_URL)
        .then(() => console.log("MongoDB is connected".bgGreen.white))
        .catch((err) => console.log("MongoDB is not connected".bgRed.white, err));
}

connectToDb();

app.get("/", async (req, res) => res.json("App is running"));

require('./controllers/botCtrl')

const PORT = process.env.PORT || 5050;
app.listen(PORT, () =>
    console.log(`Server listening => http://localhost:${PORT}`.bgCyan)
);
