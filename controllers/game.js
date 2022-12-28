import gameModel from "../models/gameModel.js";
import userModel from "../models/userModel.js";

export const startGame = async (req, res) => {
    const newGame = new gameModel();
    newGame.user = req.user.user_id; //the game's user is the current user
    try {
        await newGame.save();
        //Find current user and update gamesPlayed array
        const user = await userModel.findById(req.user.user_id);
        user.gamesPlayed.push(newGame);
        await user.save();
        res.status(201).send( `New game started successfully: ${newGame}`);
    } catch (err){
        res.status(400).json({ message: err.message });
    }
};