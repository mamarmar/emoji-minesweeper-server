import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const auth = (req, res, next) => {
    const token = 
        req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        return res.status(401).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = decoded;  //req.user is an object that contains current user's id and username
    } catch(err) {
        return res.status(403).send("Invalid token");
    }
    return next();
};