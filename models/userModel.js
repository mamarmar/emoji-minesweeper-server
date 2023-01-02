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
        totalPlayed: {
            type: Number
        },
        beginnerPlayed: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }],
        intermediatePlayed: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }],
        expertPlayed: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }],
        totalWon: {
            type: Number
        },
        beginnerWon: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }],
        intermediateWon: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }],
        expertWon: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }],
        beginnerWinPercentage: {
            type: Number
        },
        intermediateWinPercentage: {
            type: Number
        },
        expertWinPercentage: {
            type: Number
        },
        beginnerBestTime: {
            type: Number
        },
        intermediateBestTime: {
            type: Number
        },
        expertBestTime: {
            type: Number
        },
        token: {
            type: String
        }
    }
);

export default mongoose.model("User", userSchema);