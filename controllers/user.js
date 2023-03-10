import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

dotenv.config();

//Signup
export const signup = async (req, res) => {
  try {
    //Get user input
    const { username, password, country } = req.body;
    //Validate user input
    if (!(username && password && country)) {
      res.status(400).send("Username, password and country are required");
    }
    //Check if username is already taken by other user
    const otherUser = await userModel.findOne({ username });
    if (otherUser) {
      return res.status(409).send(`Username already taken. If you are ${username}, please log in. Otherwise choose different username`);
    }
    //Encrypt password
    const encryptedPassword = await bcrypt.hash(password, 10);
    //Only users with specific usernames are admins
    let isAdmin = username === "michael" || username === "margarita" ? true : false;
    //Create user in database
    const user = await userModel.create({
      isAdmin: isAdmin,
      username,
      password: encryptedPassword,
      country,
      dateJoined: new Date(),
    });
    //Create token
    const token = jwt.sign(
      { user_id: user._id, username },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );
    //Save user token
    user.token = token;
    //Return new user
    res.status(201).json(user);
  } catch (err) {
    res.status(401).send(err);
  }
};

//Login
export const login = async (req, res) => {
  try {
    //Get user input
    const { username, password } = req.body;
    //Validate user input
    if (!(username && password)) {
      res.status(400).send("All input is required");
      return;
    }
    //Validate if user exists in database
    const user = await userModel.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      //Create token
      const token = jwt.sign(
        { user_id: user._id, username },
        process.env.TOKEN_KEY,
        {
          expiresIn: "1h",
        }
      );
      //Save user token
      user.token = token;
      //Return user
      res.status(200).send({ user });
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    res.status(401).send(err);
  }
};

//Logout
export const logout = async (req, res) => {
  if (req.headers && req.headers["x-access-token"]) {
    const token = req.headers["x-access-token"];
    if (!token) {
      return res
        .status(401)
        .res.json({ success: false, message: "Authorization failed" });
    }
    //Remove token from current user
    await userModel.findByIdAndUpdate(req.user.user_id, { token: "" });
    res.status(201).json({ success: true, message: "Log out successful" });
  }
  //Need to figure out how to destroy token
};

//Get specific user by id
export const getUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No user with id: ${id}`);
  try {
    const user = await userModel.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No user with id: ${id}`);
  try {
    const currentUser = await userModel.findById(req.user.user_id);
    //Users can only be deleted by admins or themselves
    if (currentUser.isAdmin || id === req.user.user_id) {
      await userModel.findByIdAndRemove(id);
      res.status(201).json({ message: "User deleted successfully." });
    } else {
      return res.status(401).send("You are not authorized to delete this user");
    }
  } catch (err) {
      res.status(404).json({ message: err.message });
  }
}

//Get single player stats for each level
export const getPlayerStats = async (req, res) => {
  const { gameLevel } = req.query;
  try {
    const currentPlayer = await userModel.findById(req.user.user_id).populate({ path: "gamesPlayed", populate: `${gameLevel}` });
    const gamesWon = currentPlayer.gamesPlayed[gameLevel].filter((game) => game.isWon === true);
    const total = (kind) => { //kind can either be timeToComplete or moves
      //If no games have been played by the user, total time and total moves should be equal to 0
      if (currentPlayer.gamesPlayed[gameLevel].length === 0) {
        return 0;
      //If the user has played only one game, total time and total moves are equal to the time and moves of that one game
      } else if (currentPlayer.gamesPlayed[gameLevel].length === 1) {
        return currentPlayer.gamesPlayed[gameLevel][0][kind];
        //If the user has played multiple games, total time and total moves are calculated using reduce
      } else {
        return currentPlayer.gamesPlayed[gameLevel].reduce((acc, currVal) => {
          return acc + currVal[kind];
        }, 0)
      }
    };
    const stats = {
      gamesPlayed: currentPlayer.gamesPlayed[gameLevel].length,
      gamesWon: gamesWon.length,
      winPercentage: Math.round(gamesWon.length / currentPlayer.gamesPlayed[gameLevel].length * 10000) / 10000,
      bestTime: currentPlayer.bestTime[gameLevel] ? currentPlayer.bestTime[gameLevel] : "N/A",
      bestMoves: currentPlayer.bestMoves[gameLevel] ? currentPlayer.bestMoves[gameLevel] : "N/A",
      totalTime: total("timeToComplete"),
      totalMoves: total("moves")
    };
    res.status(200).send({ stats });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//Get total stats of all levels combined for single player
export const getPlayerTotals = async (req, res) => {
  try {
    const currentPlayer = await userModel.findById(req.user.user_id)
                                  .populate('gamesPlayed.beginner')
                                  .populate('gamesPlayed.intermediate')
                                  .populate('gamesPlayed.expert');
    const gamesWon = (level) => {
      let wonGames = currentPlayer.gamesPlayed[level].filter((game) => game.isWon === true)
      return wonGames;
    };
    const numOfGamesPlayed = currentPlayer.gamesPlayed.beginner.length + currentPlayer.gamesPlayed.intermediate.length + currentPlayer.gamesPlayed.expert.length;
    const numOfGamesWon = gamesWon('beginner').length + gamesWon('intermediate').length + gamesWon('expert').length;
    const total = (kind, level) => { //kind can either be timeToComplete or moves and level can be beginner | intermediate | expert
      //If no games have been played by the user, total time and total moves should be equal to 0
      if (currentPlayer.gamesPlayed[level].length === 0) {
        return 0;
      //If the user has played only one game, total time and total moves are equal to the time and moves of that one game
      } else if (currentPlayer.gamesPlayed[level].length === 1) {
        return currentPlayer.gamesPlayed[level][0][kind];
      //If the user has played multiple games, total time and total moves are calculated using reduce
      } else if (currentPlayer.gamesPlayed[level].length > 1) {
        return currentPlayer.gamesPlayed[level].reduce((acc, currVal) => {
          return acc + currVal[kind];
        }, 0);
      }
    };
    const totalStats = {
      totalGamesPlayed: numOfGamesPlayed ,
      totalGamesWon: numOfGamesWon,
      winPercentage: Math.round(numOfGamesWon / numOfGamesPlayed * 10000) / 10000,
      totalTime: total('timeToComplete', 'beginner') + total('timeToComplete', 'intermediate') + total('timeToComplete', 'expert'),
      totalMoves: total('moves', 'beginner') + total('moves', 'intermediate') + total('moves', 'expert'),
    };
    res.status(200).send({ totalStats });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//Get ranking of best moves for each level
export const getBestMovesRanking = async (req, res) => {
  const { gameLevel, numOfUsers } = req.query;
  try {
    const allUsers = await userModel.find();
    //Get only those users who have played at least 2 games at given level
    const someUsers = allUsers.filter(user => user.gamesPlayed[gameLevel].length > 2);
    const sortedUsers = someUsers.sort((a, b) => a.bestMoves[gameLevel] - b.bestMoves[gameLevel]);
    const allSortedUsers = sortedUsers.map(user => {
      return {username: user.username, bestMoves: user.bestMoves[gameLevel]}
    });
    let bestSortedUsers = numOfUsers ? allSortedUsers.slice(0, numOfUsers) : allSortedUsers;
    res.status(200).send({ bestSortedUsers });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//Get ranking of best time for each level
export const getBestTimeRanking = async (req, res) => {
  const { gameLevel, numOfUsers } = req.query;
  try {
    const allUsers = await userModel.find();
    //Get only those users who have played at least 2 games at given level
    const someUsers = allUsers.filter(user => user.gamesPlayed[gameLevel].length > 2);
    const sortedUsers = someUsers.sort((a, b) => a.bestTime[gameLevel] - b.bestTime[gameLevel]);
    const allSortedUsers = sortedUsers.map(user => {
      return {username: user.username, bestTime: user.bestTime[gameLevel]}
    });
    let bestSortedUsers = numOfUsers ? allSortedUsers.slice(0, numOfUsers) : allSortedUsers;
    res.status(200).send({ bestSortedUsers });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};