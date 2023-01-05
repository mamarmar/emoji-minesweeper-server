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
        user.gamesPlayed[gameLevel].push(newGame);
        await user.save();
        res.status(201).send( `New game started successfully: ${newGame}`);
    } catch (err){
        res.status(400).json({ message: err.message });
    }
};

export const winGame = async (req, res) => {
    const { id } = req.params;
    const { moves, time } = req.body;
    try {
        const currentGame = await gameModel.findById(id);
        currentGame.isWon = true;
        currentGame.moves = moves;
        currentGame.timeToComplete = time;
        //If player plays for the first time or has achieved a new record, update bestTime and/or bestMoves
        const currentPlayer = await userModel.findById(req.user.user_id);
        if (!currentPlayer.bestTime[currentGame.gameLevel] || time < currentPlayer.bestTime[currentGame.gameLevel]) {
            currentPlayer.bestTime[currentGame.gameLevel] = time;
        };
        if (!currentPlayer.bestMoves[currentGame.gameLevel] || moves < currentPlayer.bestMoves[currentGame.gameLevel]) {
            currentPlayer.bestMoves[currentGame.gameLevel] = moves;
        };
        currentPlayer.gamesWon[currentGame.gameLevel].push(currentGame);
        await currentPlayer.save();
        res.status(201).send( `You have won!: ${currentGame}`);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}