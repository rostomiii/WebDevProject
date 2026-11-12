// Loads Mongoose lib to talk to MongoDB
import mongoose from "mongoose";
// Defines a function that server.js calls later
const connectDB = async () => {
    try {
        /* Starts connecting to Atlas over the internet
        mongooese.connect returns a Promise, await pauses the function
        until we get that Promise */
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected Succesfully!");

    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;