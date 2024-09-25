const { Router } = require("express");
const { userMiddleware } = require("../middlewares/user");
const { purchaseModel, courseModel } = require("../db");

const coursesRouter = Router();

coursesRouter.post("/purchase", userMiddleware, async (req, res) => {
  const userId = req.userId;
  const courseId = req.body.courseId;

  await purchaseModel.create({
    userId,
    courseId,
  });
  res.json({
    message: "course has been bought",
  });
});

coursesRouter.post("/signin", (req, res) => {});

coursesRouter.get("/preview", async (req, res) => {
  const courses = await courseModel.find({});

  res.json({
    courses,
  });
});

module.exports = {
  coursesRouter: coursesRouter,
};
