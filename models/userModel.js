import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            unique: true,
            validate: [ validator.isEmail,{ message: "Valid email is required"}]
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        country: {
            type: String
        },
        dateJoined: {
            type: Date
        },
        gamesPlayed: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }],
        gamesWon: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }],
        winPercentage: {
            type: Number
        },
        bestTime: {
            type: Number
        },
        token: {
            type: String
        }
    }
);

export default mongoose.model("User", userSchema);