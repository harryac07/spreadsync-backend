const express = require("express");
const router = express.Router();

const userRouter = require("./users");
const projectRouter = require("./project");

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Success",
  });
});

router.use("/users", userRouter);
router.use("/projects", projectRouter);

module.exports = router;
