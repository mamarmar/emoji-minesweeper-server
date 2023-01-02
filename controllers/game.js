import gameModel from "../models/gameModel.js";
import userModel from "../models/userModel.js";

export const startGame = async (req, res) => {
    const { gameLevel } = req.body;
    const newGame = new gameModel(req.body);
    newGame.user = req.user.user_id; //the game's user is the current user
    try {
        await newGame.save();
        //Find current user and add new game to appropriate array
        const user = await userModel.findById(req.user.user_id);
        switch (gameLevel) {
            case 'beginner':
                user.beginnerPlayed.push(newGame);
                break;
            case 'intermediate':
                user.intermediatePlayed.push(newGame);
                break;
            case 'expert':
                user.expertPlayed.push(newGame);
                break;
        };
        await user.save();
        res.status(201).send( `New game started successfully: ${newGame}`);
    } catch (err){
        res.status(400).json({ message: err.message });
    }
};