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
        gamesPlayed: {
            beginner: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Game'
            }],
            intermediate: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Game'
            }],
            expert: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Game'
            }]
        },
        totalWon: {
            type: Number
        },
        gamesWon: {
            beginner: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Game'
            }],
            intermediate: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Game'
            }],
            expert: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Game'
            }]
        },
        bestTime: {
            beginner: Number,
            intermediate: Number,
            expert: Number
        },
        bestMoves: {
            beginner: Number,
            intermediate: Number,
            expert: Number
        },
        token: {
            type: String
        }
    }
);

export default mongoose.model("User", userSchema);