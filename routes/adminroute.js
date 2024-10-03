const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { adminModel, courseModel } = require("../db");
const { adminMiddleware } = require("../middlewares/admin");

const adminRouter = Router();
const JWT_SECRET = "your_jwt_secret";
const saltRounds = 10;

const AdminInputValidation = z.object({
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

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isPassword = await bcrypt.compare(password, admin.password);
    if (!isPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, {
      expiresIn: "2h",
    });
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
    const validatedData = AdminInputValidation.parse(req.body);
    const { firstname, lastname, password, email } = validatedData;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = new adminModel({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    const token = jwt.sign({ id: newAdmin._id, role: "admin" }, JWT_SECRET, {
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

adminRouter.put("/course", adminMiddleware, async (req, res) => {
  const adminId = req.userId;
  const { title, description, imageUrl, price, courseId } = req.body;

  try {
    const updatedCourse = await courseModel.updateOne(
      { _id: courseId, creatorId: adminId },
      { title, description, imageUrl, price }
    );

    if (!updatedCourse.nModified) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    res.json({ message: "Course updated", courseId });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update course", error: err.message });
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
