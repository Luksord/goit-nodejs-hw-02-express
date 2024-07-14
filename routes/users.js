const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const gravatar = require("gravatar");
const multer = require("multer");
const jimp = require("jimp");
const fs = require("fs/promises");
const path = require("path");

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const upload = multer({ dest: "tmp/" });

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Validation error." });
    }
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({ message: "This email is already taken." });
    }
    const avatarURL = gravatar.url(email, { s: "250", d: "identicon" });
    const newUser = new User({ email, avatarURL });
    await newUser.setPassword(password);
    await newUser.save();
    return res.status(201).json({ message: "Created new user." });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Validation error" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "No such user found" });
    }
    const isPasswordCorrect = await user.validatePassword(password);
    if (isPasswordCorrect) {
      const payload = {
        id: user._id,
        email: user.email,
      };
      const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "12h" });
      user.token = token;
      await user.save();
      return res.json({ token });
    } else {
      return res.status(401).json({ message: "Wrong password" });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/logout", auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    user.token = null;
    await user.save();
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
});

router.get("/current", auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const filePath = req.file.path;
      const image = await Jimp.read(filePath);
      await image.resize(250, 250).writeAsync(filePath);
      const { path: tempPath, filename } = req.file;
      const uniqueFilename = `${req.user._id}-${filename}`;
      const avatarDir = path.join(__dirname, "../public/avatars");
      const finalPath = path.join(avatarDir, uniqueFilename);
      await fs.rename(tempPath, finalPath);
      const avatarURL = `/avatars/${uniqueFilename}`;
      req.user.avatarURL = avatarURL;
      await req.user.save();
      res.status(200).json({ avatarURL });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
