const mongoose = require('mongoose')
require('dotenv').config();


const mongoURI = process.env.MONGO_URI;

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to mongoose successfully");
    } catch (error) {
         console.log("Error connection to MongoDB:", error);
    }
}

module.exports = connectToMongo;