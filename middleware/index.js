const passport = require('passport');

const checkAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, token) => {
    try {
      if (err) {
        throw new Error(err);
      }
      if (!token) {
        throw new Error('Authentication failed!');
      }
      req.locals = {};
      req.locals = token;
      next();
    } catch (e) {
      next(e);
    }
  })(req, res, next);
};

module.exports = {
  checkAuth,
};
