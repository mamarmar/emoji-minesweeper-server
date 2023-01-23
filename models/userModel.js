import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
    {
        isAdmin: {
            type: String,
            default: false
        },
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        country: {
            type: String,
            required: [true, 'Country is required']
        },
        dateJoined: {
            type: Date
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