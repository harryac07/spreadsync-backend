const checkPermission = (req, res, next) => {
  checkAuth(req, res, next);

  try {
    if (req.isAuthenticated) {
      next();
    } else {
      throw new Error('Not authenticated');
    }
  } catch (e) {
    next(e);
  }
};

const checkAuth = (req, res, next) => {
  /* extract token and check if it is valid */
  req.locals = {};
  req.isAuthenticated = true;
  const userId = '4b36afc8-5205-49c1-af16-4dc6f96db983';
  const accountId = '4b36afc8-5205-49c1-af16-4dc6f96db782';

  req.locals.user = {
    user_id: userId,
    account_id: accountId,
  };
};

module.exports = {
  checkPermission,
  checkAuth,
};
