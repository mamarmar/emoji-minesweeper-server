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
    res.status(201).send(`New game started successfully: ${newGame}`);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const endGame = async (req, res) => {
  const { id } = req.params;
  const { isWon, moves, time } = req.body;
  try {
    const currentGame = await gameModel.findById(id);
    currentGame.isWon = isWon;
    currentGame.moves = moves;
    currentGame.timeToComplete = time;
    await currentGame.save();
    if (isWon) {
      //If player plays for the first time or has achieved a new record, update bestTime and/or bestMoves
      const currentPlayer = await userModel.findById(req.user.user_id);
      if (
        !currentPlayer.bestTime[currentGame.gameLevel] ||
        time < currentPlayer.bestTime[currentGame.gameLevel]
      ) {
        currentPlayer.bestTime[currentGame.gameLevel] = time;
      }
      if (
        !currentPlayer.bestMoves[currentGame.gameLevel] ||
        moves < currentPlayer.bestMoves[currentGame.gameLevel]
      ) {
        currentPlayer.bestMoves[currentGame.gameLevel] = moves;
      }
      await currentPlayer.save();
    }
    res.status(201).send(`The game has ended: ${currentGame}`);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//Get platform stats for each level
export const getPlatformStats = async (req, res) => {
  const { gameLevel } = req.query;
  try {
    const allGamesOfGivenLevel = await gameModel.find({ gameLevel: gameLevel });
    const wonGames = allGamesOfGivenLevel.filter((game) => game.isWon === true);
    const best = (kind) => {
      if (!wonGames.length) {
        return "N/A";
      } else if (wonGames.length === 1) {
        return wonGames[0][kind];
      } else {
        const bestOfKind = wonGames.reduce((min, element) => {
          return min[kind] < element[kind] ? min[kind] : element[kind];
        });
        return bestOfKind;
      }
    };
    const total = (kind) => {
      if (!allGamesOfGivenLevel.length) {
        return 0;
      } else if (allGamesOfGivenLevel.length === 1) {
        return allGamesOfGivenLevel[0][kind];
      } else {
        const totalOfKind = allGamesOfGivenLevel.reduce((acc, currVal) => {
          return acc[kind] + currVal[kind];
        });
        return totalOfKind;
      }
    };
    const platformStats = {
      gamesPlayed: allGamesOfGivenLevel.length,
      gamesWon: wonGames.length,
      bestTime: best("timeToComplete"),
      bestMoves: best("moves"),
      totalTime: total("timeToComplete"),
      totalMoves: total("moves"),
    };
    res.status(201).send({ platformStats });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//Get total stats of all levels combined for the whole platform
