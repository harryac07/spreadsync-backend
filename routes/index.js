const express = require("express");
const router = express.Router();

const { usersController } = require("../controllers");

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Success",
  });
});

router.get("/users", usersController.getAllUsers);
router.get("/users/:id", usersController.getUserById);

module.exports = router;
