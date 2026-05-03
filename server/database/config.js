const mongoose = require("mongoose");

const DB = process.env.MONGO_URI;

mongoose.connect(DB)
    .then(() => {
        console.log("Database connected!");
    })
    .catch((error) => {
        console.error("Failed to connect database.", error);
    });
