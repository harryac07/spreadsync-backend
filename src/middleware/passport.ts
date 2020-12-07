import * as passport from 'passport';
import { Strategy as localStrategy } from 'passport-local';
import { Strategy as JWTstrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';

// Passport middleware to handle user registration
passport.use(
  'signup',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        if (!email) {
          return done(null, false, { message: 'Email is required!' });
        }
        if (!password) {
          return done(null, false, { message: 'Password is required!' });
        }
        return done(null, true);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// Passport middleware to handle User login
passport.use(
  'login',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        if (!email) {
          return done(null, false, { message: 'Email is required!' });
        }
        if (!password) {
          return done(null, false, { message: 'Password is required!' });
        }
        return done(null, true);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// This verifies that the token sent by the user is valid
passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
