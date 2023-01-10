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
    const gamesWon = allGamesOfGivenLevel.filter((game) => game.isWon === true);
    const best = (kind) => { //kind can either be timeToComplete or moves
      //If no games have been won across the platform, best time and best moves should be unavailable
      if (!gamesWon.length) {
        return "N/A";
      //If only one game has been won across the platform, best time and moves are equal to the time and moves this game took to complete
      } else if (gamesWon.length === 1) {
        return gamesWon[0][kind];
      //If there are multiple won games across the platform, the best time and moves will be calculated using reduce
      } else {
        return gamesWon.reduce((min, element) => {
          return min[kind] < element[kind] ? min[kind] : element[kind];
        });
      }
    };
    const total = (kind) => { //kind can either be timeToComplete or moves
      //If no games have been played across the platform, total time and total moves should be equal to 0
      if (!allGamesOfGivenLevel.length) {
        return 0;
      //If only one game has been played across the platform, total time and moves are equal to the time and moves this game took to complete
      } else if (allGamesOfGivenLevel.length === 1) {
        return allGamesOfGivenLevel[0][kind];
      //If multiple games have been played across the platform, the total time and moves will be calculated using reduce
      } else {
        return allGamesOfGivenLevel.reduce((acc, currVal) => {
          return acc + currVal[kind];
        }, 0);
      }
    };
    const platformStats = {
      gamesPlayed: allGamesOfGivenLevel.length,
      gamesWon: gamesWon.length,
      winningPercentage: Math.round(gamesWon.length / allGamesOfGivenLevel.length * 10000) / 10000,
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
export const getPlatformTotals = async (req, res) => {
  try {
    const allGames = await gameModel.find();
    const allUsers = await userModel.find();
    const gamesWon = allGames.filter(game => game.isWon === true).length;
    const total = (kind) => { //kind can either be timeToComplete or moves
      //If no games have been played across the platform, total time and total moves should be equal to 0
      if (!allGames.length) {
        return 0;
      //If only one game has been played across the platform, total time and moves are equal to the time and moves this game took to complete
      } else if (allGames.length === 1) {
        return allGames[0][kind];
      //If multiple games have been played across the platform, the total time and moves will be calculated using reduce
      } else {
        return allGames.reduce((acc, currVal) => {
          return acc + currVal[kind];
        }, 0);
      }
    };
    const totalStats = {
      registeredPlayers: allUsers.length,
      totalGamesPlayed: allGames.length,
      totalGamesWon: gamesWon,
      winningPercentage: Math.round(gamesWon / allGames.length * 10000) / 10000,
      totalTime: total("timeToComplete"),
      totalMoves: total("moves")
    };
    res.status(201).send({ totalStats });
  } catch (err) {
      res.status(404).json({ message: err.message });
  }
};