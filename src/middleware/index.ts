import passport from 'passport';
import { intersection, flatten } from 'lodash';
import { User } from '../models';
import cache from '../util/nodeCache';

const checkAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, token) => {
    try {
      if (err) {
        throw new Error(err);
      }
      if (!token) {
        throw new Error('Invalid token. Authentication failed!');
      }
      const userId = token.id;
      const accountId = req.headers?.account_id;
      let permissions: any[] = [];
      let userInvolvements: any[] = [];
      const cacheKey = `getPermissionForUserByAccountId-${userId}`;

      if (accountId) {
        userInvolvements = await cache.getOrSet(cacheKey, () => User.getPermissionForUserByAccountId(userId, accountId));
      } else {
        userInvolvements = await cache.get(cacheKey) || [];
      }

      const uniquePermissions = new Set(
        flatten(
          userInvolvements?.map(({ project_permission }) => project_permission?.split(','))
        )
      );

      permissions = Array.from(uniquePermissions)

      req.locals = {};
      req.locals.user = token;
      req.locals.user.permissions = permissions;
      req.locals.user.account = accountId;
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
