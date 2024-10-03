const { Router } = require("express");
const { userMiddleware } = require("../middlewares/user");
const { adminMiddleware } = require("../middlewares/admin");
const { purchaseModel, courseModel } = require("../db");

const coursesRouter = Router();

coursesRouter.post("/create", userMiddleware, async (req, res) => {
  const {
    title,
    description,
    category,
    level,
    duration,
    price,
    validity,
    imageUrl,
  } = req.body;
  const creatorId = req.userId;

  try {
    await courseModel.create({
      category,
      level,
      duration,
      title,
      validity,
      description,
      price,
      imageUrl,
      creatorId,
      isApproved: false,
    });
    res.json({
      message: "Course created, pending admin approval",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the course",
      error: error.message,
    });
  }
});

coursesRouter.post("/approve/:courseId", adminMiddleware, async (req, res) => {
  const courseId = req.params.courseId;

  try {
    await courseModel.findByIdAndUpdate(courseId, { isApproved: true });
    res.json({
      message: "Course approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while approving the course",
      error: error.message,
    });
  }
});

coursesRouter.delete("/delete/:courseId", adminMiddleware, async (req, res) => {
  const courseId = req.params.courseId;

  try {
    await courseModel.findByIdAndDelete(courseId);
    res.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the course",
      error: error.message,
    });
  }
});

coursesRouter.get("/pending", adminMiddleware, async (req, res) => {
  try {
    const courses = await courseModel.find({ isApproved: false });
    res.json({
      courses,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching courses",
      error: error.message,
    });
  }
});

coursesRouter.get("/preview", async (req, res) => {
  try {
    const courses = await courseModel.find({ isApproved: true });
    res.json({
      courses,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching courses",
      error: error.message,
    });
  }
});

coursesRouter.get("/:courseId", async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const course = await courseModel.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.json({
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching the course",
      error: error.message,
    });
  }
});

coursesRouter.get("/purchase", userMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const purchases = await purchaseModel.find({ userId }).populate("courseId");
    res.json({
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching purchases",
      error: error.message,
    });
  }
});

module.exports = {
  coursesRouter: coursesRouter,
};
