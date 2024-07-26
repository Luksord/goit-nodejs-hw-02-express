const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { v4: uuidv4 } = require("uuid");
const email = require("../models/email");

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

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
    const verificationToken = uuidv4();
    const newUser = new User({ email, avatarURL, verificationToken });
    await newUser.setPassword(password);
    await newUser.save();
    const verifyEmail = `http://localhost:3000/api/users/verify/${verificationToken}`;
    const html = `<p>Click the following link to verify your email: <a href="${verifyEmail}">Verify Email</a></p>`;
    await email(html, "Verify your email", email);
    return res.status(201).json({
      message:
        "Created new user. Please check your email to verify your account.",
    });
  } catch (error) {
    console.log(error);
    return next(error);
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
      return res.status(401).json({ message: "User not found" });
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

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.verificationToken = null;
    user.verify = true;
    await user.save();
    return res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Missing required field email" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.verify) {
      return res.status(400).json({ message: "Verification already passed" });
    }
    const verifyEmail = `http://localhost:3000/users/verify/${user.verificationToken}`;
    const html = `<p>Click the following link to verify your email: <a href="${verifyEmail}">Verify Email</a></p>`;
    await email(html, "Verify your email", email);
    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
