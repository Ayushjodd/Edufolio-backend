const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { adminModel, courseModel } = require("../db");
const { adminMiddleware } = require("../middlewares/admin");

const adminRouter = Router();
const { JWT_ADMIN_PASSWORD } = require("../config");
const saltRounds = 10;

const AdminInputValidation = z.object({
  username: z.string().min(1, "username is required"),
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

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isPassword = await bcrypt.compare(password, admin.password);
    if (!isPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const adminToken = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_ADMIN_PASSWORD,
      {
        expiresIn: "2h",
      }
    );
    res.json({ message: "Login successful", adminToken });
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
    const validatedData = AdminInputValidation.parse(req.body);
    const { username, password, email } = validatedData;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = new adminModel({
      username,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    const adminToken = jwt.sign(
      { id: newAdmin._id, role: "admin" },
      JWT_ADMIN_PASSWORD,
      {
        expiresIn: "2h",
      }
    );
    res.json({ message: "Signup successful", adminToken });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation error", errors: err.errors });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

adminRouter.get("/course/bulk", adminMiddleware, async (req, res) => {
  const adminId = req.userId;

  try {
    const courses = await courseModel.find({ creatorId: adminId });
    res.json({ message: "Courses fetched successfully", courses });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch courses", error: err.message });
  }
});

module.exports = { adminRouter };
