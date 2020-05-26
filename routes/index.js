const express = require('express');
const router = express.Router();

const userRouter = require('./users');
const projectRouter = require('./project');
const authRouter = require('./auth');

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Success',
  });
});

router.use('/users', userRouter);
router.use('/projects', projectRouter);
router.use('/auth', authRouter);

module.exports = router;
