import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
    {
        gameLevel: {
            type: String
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        isWon: {
            type: Boolean,
            default: false
        },
        moves: {
            type: Number
        },
        timeToComplete: {
            type: Number
        }
    }
);

export default mongoose.model("Game", gameSchema);