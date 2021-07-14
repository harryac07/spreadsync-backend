import passport from 'passport';
import { intersection } from 'lodash';
import { User } from '../models';

const checkAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, token) => {
    try {
      if (err) {
        throw new Error(err);
      }
      if (!token) {
        throw new Error('Invalid token. Authentication failed!');
      }
      const accountId = req.headers?.account_id;
      let permissions = [] as string[];

      if (accountId) {
        const userInvolvements = await User.getPermissionForUserByAccountId(token.id, req.headers?.account_id);
        const uniquePermissions = new Set(userInvolvements?.map(({ project_permission }) => project_permission));
        permissions = Array.from(uniquePermissions)
      }
      req.locals = {};
      req.locals.user = token;
      req.locals.user.permissions = permissions;
      next();
    } catch (e) {
      console.error('error ', e.stack);
      next(e);
    }
  })(req, res, next);
};

const checkPermission = (...permittedRoles) => {
  return (req, res, next) => {
    const { permissions, email } = req.locals?.user;
    const foundPermissions = intersection(permittedRoles, permissions);
    const isPermissionOk = permissions.includes('admin') || foundPermissions?.length;

    if (email && isPermissionOk) {
      next();
    } else {
      throw new Error('Access to the route is not allowed!');
    }
  }
}


export {
  checkAuth,
  checkPermission,
};
