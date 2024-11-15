require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { userRouter } = require("./routes/userRouter");
const { coursesRouter } = require("./routes/coursesRouter");
const { adminRouter } = require("./routes/adminroute");
const mongoose = require("mongoose");
const app = express();

app.use(
  cors({
    origin: "https://edufolio-five.vercel.app",
    methods: "GET ,POST, PUT, DELETE",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", coursesRouter);

async function main() {
  await mongoose.connect(process.env.DATABASE_URL);
  app.listen(3000);
  console.log("server started");
}

main();
