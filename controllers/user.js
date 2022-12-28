import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

dotenv.config();

//Signup
export const signup = async (req, res) => {
    try {
      //Get user input
      const {
        username,
        email,
        password,
        country,
      } = req.body;
      //Validate user input
      if (
        !(
          username &&
          email &&
          password 
        )
      ) {
        res.status(400).send("Username, email and password are required");
      }
      //Check if username is already taken by other user
      const otherUser = await userModel.findOne({ username });
      if (otherUser) {
        return res.status(409).send("Username already taken.");
      }
      //Check if user already exists
      //Validate if user exists in database
      const oldUser = await userModel.findOne({ email });
      if (oldUser) {
        return res.status(409).send("User already exists. Please log in.");
      }
      //Encrypt password
      const encryptedPassword = await bcrypt.hash(password, 10);
      //Create user in database
      const user = await userModel.create({
        username,
        email,
        password: encryptedPassword,
        country,
        dateJoined: new Date()
      });
      //Create token
      const token = jwt.sign(
        { user_id: user._id, username, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "1h",
        }
      );
      //Save user token
      user.token = token;
      //Return new user
      res.status(201).json(user);
    } catch (err) {
      res.status(401).send(err);
    }
  };