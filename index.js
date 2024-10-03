require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { userRouter } = require("./routes/userRouter");
const { coursesRouter } = require("./routes/coursesRouter");
const { adminRouter } = require("./routes/adminroute");
const mongoose = require("mongoose");
const app = express();

const corsOptions = {
  origin: "https://edufolio-five.vercel.app/",
  credentials: true,
};

app.use(cors(corsOptions));
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
