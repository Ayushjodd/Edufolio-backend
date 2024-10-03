const { Router } = require("express");
const userRouter = Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");
const saltRounds = 10;
const { z } = require("zod");
const User = require("../db");
const { userMiddleware } = require("../middlewares/user");
const { purchaseModel, courseModel } = require("../db");

const UserInputValidation = z.object({
  username: z.string().min(1, "username is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const LoginValidation = z.object({
      email: z.string().email("Invalid email format"),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
    });
    LoginValidation.parse(req.body);

    const user = await User.userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (!JWT_USER_PASSWORD) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign({ id: user._id }, JWT_USER_PASSWORD, {
      expiresIn: "2h",
    });
    res.json({ message: "Login successful", token });
  } catch (e) {
    console.error("Login error:", e);

    if (e instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation error", errors: e.errors });
    }

    res.status(500).json({ message: "Server error" });
  }
});

userRouter.post("/signup", async (req, res) => {
  try {
    const validatedData = UserInputValidation.parse(req.body);

    const { username, password, email } = validatedData;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User.userModel({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_USER_PASSWORD, {
      expiresIn: "2h",
    });

    res.json({ message: "Signup successful", token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation error", errors: err.errors });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

userRouter.get("/purchases", userMiddleware, async (req, res) => {
  const userId = req.userId;

  const purchases = await purchaseModel.find({
    userId,
  });
  let purchasedCourseIds = [];

  for (let i = 0; i < purchases.length; i++) {
    purchasedCourseIds.push(purchases[i].courseId);
  }

  const coursesData = await courseModel.find({
    _id: { $in: purchasedCourseIds },
  });

  res.json({
    purchases,
    coursesData,
  });
});

module.exports = { userRouter };
