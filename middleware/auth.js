const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] ?? null;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findOne({ _id: decoded.id, token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user; // Zapisujemy użytkownika do req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// const auth = async (req, res, next) => {
//   passport.authenticate(
//     "jwt",
//     {
//       session: false,
//     },
//     (err, user) => {
//       if (!user || err) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }
//       res.locals.user = user;
//       next();
//     }
//   )(req, res, next);
// };

module.exports = auth;
