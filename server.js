import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import mongoose from "mongoose";
//Import route modules
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

app.use(express.json());
app.use(cors());
//Route modules
app.use("/user", userRoutes);

//Connection to Database
mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Successfully connected to database")
    })
    .catch(err => {
        console.log("Database connection failed. Exiting now.");
        console.error(err);
    });

app.listen(port, () => {
    console.log(`Server is up at port ${port}`);
});
