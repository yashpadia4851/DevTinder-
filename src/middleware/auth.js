const jwt = require("jsonwebtoken");
const { UserModel } = require("../modules/user");

const userAuth = async (req, res, next) => {
  try {
    // Read the token from the req cookies
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({message : 'Please Login!'})
    };

    const decodedObj = await jwt.verify(token, "Dev@Tinder$123");
    const { _id } = decodedObj;

    // Find the user
    const user = await UserModel.findById(_id);
    if (!user) throw new Error("user is not present or not found");

    req.user = user;
    next();
  } catch (err) {
    console.log("Auth middleware error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token has expired");
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).send("Token is invalid");
    }

    res.status(401).send(err.message || "Authentication failed");
  }
};

module.exports = { userAuth };
