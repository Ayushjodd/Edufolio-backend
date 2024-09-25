const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const coursesRouter = require("./routes/coursesRouter");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/user", userRouter);
app.use("/course", coursesRouter);
app.use("/admin", coursesRouter);

app.listen(3000, () => console.log("server started at PORT:3000"));
