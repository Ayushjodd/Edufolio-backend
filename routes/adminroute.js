const { Router } = require("express");
const adminRouter = Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_jwt_secret";
const saltRounds = 10;
const { z } = require("zod");
const User = require("../db");
const { adminMiddleware } = require("../middlewares/admin");

const UserInputValidation = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  firstname: z.string().min(1, "Firstname is required"),
  lastname: z.string().min(1, "Lastname is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

adminRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const LoginValidation = z.object({
      email: z.string().email("Invalid email format"),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
    });
    LoginValidation.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ message: "Login successful", token });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation error", errors: e.errors });
    }
    res.status(500).json({ message: "Server error" });
  }
});

adminRouter.post("/signup", async (req, res) => {
  try {
    const validatedData = UserInputValidation.parse(req.body);

    const { firstname, lastname, password, email } = validatedData;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.json({ message: "Signup successful" });
  } catch (err) {
    if (err) {
      return res
        .status(400)
        .json({ message: "Validation error", errors: "gadbad-hai-bidu" });
    }
    res.status(500).json({ message: "Server error", error: "gadbad-hai-bidu" });
  }
});

adminRouter.put("/course", adminMiddleware, async (req, res) => {
  const adminId = req.userId;

  const { title, description, imageUrl, price, courseId } = req.body;
  const course = await courseModel.updateOne(
    {
      _id: courseId,
      creatorId: adminId,
    },
    {
      title: title,
      description: description,
      imageUrl: imageUrl,
      price: price,
    }
  );

  res.json({
    message: "Course updated",
    courseId: course._id,
  });
});

adminRouter.post("/course/bulk", adminMiddleware, async (req, res) => {
  const adminId = req.userId;

  const courses = await courseModel.find({
    creatorId: adminId,
  });

  res.json({
    message: "Course updated",
    courses,
  });
});

module.exports = { adminRouter };
